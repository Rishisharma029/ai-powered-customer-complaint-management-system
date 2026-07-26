import io
import os
import logging
import json
import re
from typing import Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pypdf import PdfReader

from app.schemas import AnalyzeRequest, EditComplaintRequest
from app.ai.graph import build_complaint_workflow
from app.ai.llm import call_groq_llm, extract_json_from_llm_response

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])
logger = logging.getLogger("copilot_router")

WORD_TO_NUM = {
    "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
    "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
    "twenty": "20", "fifty": "50", "hundred": "100"
}

SAMPLE_DOCUMENTS = {
    "tablet_chipping": """
CUSTOMER COMPLAINT REPORT
Date: 2026-07-20
Reporting Entity: St. Jude Hospital Pharmacy, Boston MA
Reporter: Dr. Sarah Jenkins (Lead Clinical Pharmacist)
Contact: sjenkins@stjudehospital.org | (617) 555-0192

Product Details:
- Product Name: Paracetamol 500mg Tablets USP (Finished Dosage Form - FDF)
- Batch/Lot Number: B-9941
- Manufacturing Date: 2026-01-15 | Expiry Date: 2028-01-14
- Affected Quantity: 15 Bottles (1,500 Tablets)

Complaint Description:
During routine ward dispensing on July 19th, pharmacy staff observed severe surface chipping, edge erosion, and brownish discoloration on approx 20% of tablets in Bottle #4 and #7 of Batch B-9941. Several tablets crumbled upon removal from the blister bottle. No adverse patient events reported so far, but bottle dispensing has been suspended pending QMS investigation.
""",
    "api_impurity": """
QUALITY DEFECT INCIDENT NOTICE - API INGESTION
Date: 2026-07-22
Reporting Entity: Apex Formulations Quality Assurance Dept
Reporter: Michael Chang (QA Director)
Contact: mchang@apexformulations.com

Product Details:
- Product Name: Amoxicillin Trihydrate API (Active Pharmaceutical Ingredient)
- Batch/Lot Number: A-4022
- Manufacturing Date: 2026-03-10 | Expiry Date: 2029-03-09
- Affected Quantity: 2 Drums (100 kg Bulk Powder)

Complaint Description:
Incoming Raw Material QC Testing at our formulation plant revealed an Out-of-Specification (OOS) related substance impurity peak (Impurity C at 0.42%, exceeding ICH Q3A threshold of 0.15%). Further analysis showed yellow discoloration specks in Drum #1. Material is currently quarantined in Raw Material Warehouse 3.
""",
    "packaging_leak": """
DISTRIBUTOR COMPLAINT EMAIL
From: Logistics & QC Team <qc@medidistributors.com>
To: Pharma Quality Management Systems <complaints@pharmamanufacturer.com>
Date: July 24, 2026

Subject: URGENT: Defective Blister Packaging Seal - Metformin HCl 850mg (Batch M-7712)

Dear QMS Team,

We received Shipment #SF-8839 today containing Metformin HCl 850mg Film-Coated Tablets (Batch M-7712, Mfg: 2026-02-01). 

During warehouse inspection, 4 out of 50 outer cartons showed dampness. Inspection of blister packs inside revealed unsealed aluminum foil backings along the upper edge of Blister Pack Series 12-B. 80 blister units affected. Moisture ingress has caused tablet swelling inside the blisters.

Please advise on RGA (Return Goods Authorization) and immediate containment.

Regards,
Robert Vance
Operations Manager, MediDistributors Inc.
"""
}

# --- TOOL 1: Log Complaint Tool ---
@router.post("/analyze")
def analyze_complaint(request: AnalyzeRequest) -> Dict[str, Any]:
    raw_text = request.raw_text
    
    if not raw_text and request.sample_id:
        raw_text = SAMPLE_DOCUMENTS.get(request.sample_id)
        if not raw_text:
            raise HTTPException(status_code=400, detail="Invalid sample_id provided")
            
    if not raw_text or len(raw_text.strip()) == 0:
        raise HTTPException(status_code=400, detail="No complaint text provided for analysis")
        
    try:
        app_graph = build_complaint_workflow()
        
        initial_state = {
            "raw_text": raw_text,
            "extracted_fields": {},
            "completeness": {},
            "duplicates": {},
            "risk_assessment": {},
            "root_cause": {},
            "capa_recommendations": {},
            "executive_summary": "",
            "graph_trace": []
        }
        
        final_state = app_graph.invoke(initial_state)
        return final_state
    except Exception as e:
        logger.error(f"LangGraph execution error: {e}")
        raise HTTPException(status_code=500, detail=f"LangGraph Workflow failed: {str(e)}")


# --- TOOL 2: Edit Complaint Tool ---
@router.post("/edit")
def edit_complaint(request: EditComplaintRequest) -> Dict[str, Any]:
    current_state = request.current_form_state
    edit_prompt = request.edit_prompt
    
    prompt = f"""
You are an AI QMS Copilot. The user wants to update an existing customer complaint form using natural language instructions.
CRITICAL RULE: Modify ONLY the fields explicitly mentioned or implied by the edit instruction. Keep ALL existing fields unchanged. Also update the risk assessment, RCA, or CAPA if the change affects severity or patient safety.

Current Complaint Form State (JSON):
{json.dumps(current_state, indent=2)}

Edit Instruction:
\"{edit_prompt}\"

Return a strict JSON object with updated fields:
- extracted_fields (dict containing all form fields like product_name, batch_number, defect_category, defect_description, reporter_name, reporter_organization, date_received, quantity_affected, etc.)
- risk_assessment (dict containing severity_score 1-5, likelihood_score 1-5, risk_level, risk_justification, requires_regulatory_reporting, regulatory_details)
- root_cause (dict containing root_cause_summary, five_whys array, ishikawa_categories)
- capa_recommendations (dict containing capa_containment, capa_corrective, capa_preventive)
- executive_summary (string)
- copilot_explanation (string explanation of what was updated for the user)
"""
    system_prompt = "You are a QMS Form Editor AI. Preserve unchanged fields strictly and output valid JSON only."
    llm_output = call_groq_llm(prompt, system_prompt)
    updated_data = extract_json_from_llm_response(llm_output) if llm_output else {}
    
    if not updated_data.get("extracted_fields"):
        updated_data = fallback_edit_heuristics(current_state, edit_prompt)
        
    # Re-calculate completeness score & remaining missing fields
    extracted = updated_data.get("extracted_fields", {})
    mandatory_checks = [
        ("product_name", "Missing Product Name"),
        ("batch_number", "Missing Batch Number"),
        ("quantity_affected", "Missing Quantity"),
        ("date_received", "Missing Date"),
        ("reporter_name", "Missing Reporter"),
        ("defect_description", "Missing Defect Description")
    ]
    missing_items = []
    present_count = 0
    for fk, label in mandatory_checks:
        val = extracted.get(fk)
        if val and str(val).strip() != "" and str(val).strip().lower() not in ["null", "none", "unknown", "n/a"]:
            present_count += 1
        else:
            missing_items.append(label)
            
    score = round((present_count / len(mandatory_checks)) * 100, 1)
    updated_data["completeness"] = {
        "completeness_score": score,
        "missing_fields": missing_items,
        "is_complete": len(missing_items) == 0,
        "recommendation": "All mandatory QMS fields are provided." if len(missing_items) == 0 else f"Incomplete Complaint! Missing: {', '.join(missing_items)}"
    }
        
    return updated_data


# --- TOOL 3: Document Extraction Tool ---
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    filename = file.filename.lower()
    content = ""
    
    try:
        file_bytes = await file.read()
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    content += text + "\n"
        else:
            content = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")
        
    if not content.strip():
        content = f"Uploaded document filename: {file.filename}. Defect noted in pharmaceutical packaging/batch."
        
    return analyze_complaint(AnalyzeRequest(raw_text=content))


@router.get("/samples")
def get_samples():
    return [
        {
            "id": "tablet_chipping",
            "title": "FDF - Paracetamol Tablet Chipping & Discoloration (Batch B-9941)",
            "subtitle": "Hospital report regarding surface erosion and chipping.",
            "category": "Physical",
            "risk": "Major"
        },
        {
            "id": "api_impurity",
            "title": "API - Amoxicillin Trihydrate OOS Impurity Peak (Batch A-4022)",
            "subtitle": "Raw material chemical OOS impurity peak above ICH Q3A limit.",
            "category": "Chemical",
            "risk": "Critical"
        },
        {
            "id": "packaging_leak",
            "title": "Packaging - Metformin HCl Blister Foil Unsealed (Batch M-7712)",
            "subtitle": "Distributor report of unsealed blister aluminum foil with moisture swelling.",
            "category": "Packaging",
            "risk": "Medium"
        }
    ]


# --- ENHANCED EDIT HEURISTICS ---
def fallback_edit_heuristics(current_state: Dict[str, Any], prompt: str) -> Dict[str, Any]:
    updated_fields = dict(current_state)
    prompt_lower = prompt.lower()
    explanation_parts = []
    
    # 1. Reporter Name & Organization Updates
    rep_match = re.search(r"(?:reporter|from|name)\s*(?:is|actually|to|changed to)?\s*[:\-]?\s*((?:Dr\.?|Mr\.?|Ms\.?|Prof\.?)\s+[A-Za-z\s]+?)(?=\s+from\b|\s+at\b|\s*[\n,.]|$)", prompt, re.IGNORECASE)
    if rep_match:
        new_rep = rep_match.group(1).strip()
        updated_fields["reporter_name"] = new_rep
        explanation_parts.append(f"Updated Reporter Name to '{new_rep}'.")
    else:
        plain_rep = re.search(r"((?:Dr\.?|Mr\.?|Ms\.?|Prof\.?)\s+[A-Z][a-z]+\s+[A-Z][a-z]+)", prompt)
        if plain_rep:
            new_rep = plain_rep.group(1).strip()
            updated_fields["reporter_name"] = new_rep
            explanation_parts.append(f"Updated Reporter Name to '{new_rep}'.")

    org_match = re.search(r"(?:from|at|organization|org)\s+([^\n,.]+?(?:Hospital|Pharmacy|Clinic|Center|Distributor|Inc|Corp|Ltd))", prompt, re.IGNORECASE)
    if org_match:
        new_org = org_match.group(1).strip()
        updated_fields["reporter_organization"] = new_org
        explanation_parts.append(f"Updated Organization to '{new_org}'.")

    # 2. Batch Number Updates
    b_match = re.search(r"\b([a-zA-Z]{1,4}\-\d{3,7}|\d{4,8})\b", prompt)
    if b_match:
        new_b = b_match.group(1).upper()
        updated_fields["batch_number"] = new_b
        explanation_parts.append(f"Updated Batch Number to '{new_b}'.")

    # 3. Quantity Affected Updates (Handles "five bottles were affected", "10 bottles affected")
    word_num_pattern = r"(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|fifty|hundred)"
    qty_sentence = re.search(fr"({word_num_pattern}\s*(?:bottles?|tablets?|drums?|vials?|boxes?|cartons?|kg|units?)\s*(?:\([^)]+\))?)\s*(?:were\s+|are\s+)?affected", prompt, re.IGNORECASE)
    if qty_sentence:
        raw_qty = qty_sentence.group(1).strip()
        for word, num in WORD_TO_NUM.items():
            if raw_qty.lower().startswith(word):
                raw_qty = raw_qty.lower().replace(word, num, 1)
                break
        new_q = raw_qty.capitalize()
        updated_fields["quantity_affected"] = new_q
        explanation_parts.append(f"Updated Quantity to '{new_q}'.")
    else:
        qty_match = re.search(r"(\d+\s*(?:bottles?|tablets?|drums?|vials?|boxes?|cartons?|kg|units?))", prompt, re.IGNORECASE)
        if qty_match:
            new_q = qty_match.group(1).strip().capitalize()
            updated_fields["quantity_affected"] = new_q
            explanation_parts.append(f"Updated Quantity to '{new_q}'.")

    # 4. Product Name Updates
    for p in ["paracetamol", "ibuprofen", "cefixime", "amoxicillin", "metformin", "ciprofloxacin"]:
        if p in prompt_lower and not current_state.get("product_name", "").lower().startswith(p):
            new_p = p.capitalize() + " Tablets"
            updated_fields["product_name"] = new_p
            explanation_parts.append(f"Updated Product Name to '{new_p}'.")
            break

    # 5. Risk Assessment Escalation / Adjustment
    if "critical" in prompt_lower or "severe" in prompt_lower or "allergic" in prompt_lower or "hospital" in prompt_lower or "over-dosage" in prompt_lower:
        risk_assessment = {
            "severity_score": 5,
            "likelihood_score": 5,
            "risk_level": "Critical",
            "risk_justification": f"Risk escalated to Critical per edit prompt: {prompt}",
            "requires_regulatory_reporting": True,
            "regulatory_details": "FDA 3-Day Field Alert Report (FAR) mandatory due to critical safety/adverse event escalation."
        }
        updated_fields["priority"] = "Critical"
    else:
        risk_assessment = {
            "severity_score": current_state.get("severity_score", 3),
            "likelihood_score": current_state.get("likelihood_score", 3),
            "risk_level": current_state.get("risk_level", "Major"),
            "risk_justification": current_state.get("risk_justification", "QRM risk rating preserved."),
            "requires_regulatory_reporting": current_state.get("requires_regulatory_reporting", False),
            "regulatory_details": current_state.get("regulatory_details", "")
        }

    explanation_str = " ".join(explanation_parts) if explanation_parts else "Updated complaint form based on natural language edit instruction while preserving existing fields."

    return {
        "extracted_fields": updated_fields,
        "risk_assessment": risk_assessment,
        "root_cause": {
            "root_cause_summary": current_state.get("root_cause_summary", "Root cause investigation updated."),
            "five_whys": current_state.get("five_whys", []),
            "ishikawa_categories": current_state.get("ishikawa_categories", {})
        },
        "capa_recommendations": {
            "capa_containment": current_state.get("capa_containment", ""),
            "capa_corrective": current_state.get("capa_corrective", ""),
            "capa_preventive": current_state.get("capa_preventive", "")
        },
        "executive_summary": f"Form updated via Edit Tool. {explanation_str}",
        "copilot_explanation": explanation_str
    }
