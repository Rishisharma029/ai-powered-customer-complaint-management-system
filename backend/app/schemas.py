from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ComplaintBase(BaseModel):
    product_name: str = ""
    product_type: str = "FDF"
    batch_number: str = ""
    manufacturing_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    dosage_form: Optional[str] = ""
    defect_category: str = "Physical"
    defect_description: str = ""
    reporter_name: Optional[str] = ""
    reporter_organization: Optional[str] = ""
    reporter_contact: Optional[str] = ""
    date_received: str = ""
    quantity_affected: Optional[str] = ""
    
    severity_score: int = 1
    likelihood_score: int = 1
    risk_level: str = "Low"
    risk_justification: Optional[str] = ""
    requires_regulatory_reporting: bool = False
    regulatory_details: Optional[str] = ""
    
    completeness_score: float = 100.0
    missing_fields: Optional[List[str]] = []
    is_duplicate: bool = False
    duplicate_references: Optional[List[str]] = []
    
    root_cause_summary: Optional[str] = ""
    five_whys: Optional[List[str]] = []
    ishikawa_categories: Optional[Dict[str, List[str]]] = {}
    capa_containment: Optional[str] = ""
    capa_corrective: Optional[str] = ""
    capa_preventive: Optional[str] = ""
    
    status: str = "Under Investigation"
    priority: str = "Medium"

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: int
    complaint_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyzeRequest(BaseModel):
    raw_text: Optional[str] = None
    sample_id: Optional[str] = None

class EditComplaintRequest(BaseModel):
    current_form_state: Dict[str, Any]
    edit_prompt: str

class LangGraphState(BaseModel):
    raw_text: str
    extracted_fields: Dict[str, Any] = {}
    completeness: Dict[str, Any] = {}
    duplicates: Dict[str, Any] = {}
    risk_assessment: Dict[str, Any] = {}
    root_cause: Dict[str, Any] = {}
    capa_recommendations: Dict[str, Any] = {}
    executive_summary: str = ""
    graph_trace: List[Dict[str, Any]] = []
