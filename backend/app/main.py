import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import Complaint, AuditTrail
from app.routers import complaints, copilot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pharma_qms_main")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Customer Complaint Management System for Pharma (API & FDF) using LangGraph and Groq LLM",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_database_if_empty():
    db = SessionLocal()
    try:
        count = db.query(Complaint).count()
        if count == 0:
            logger.info("Seeding initial QMS database with sample complaints...")
            seed_complaints = [
                Complaint(
                    complaint_number="CMP-2026-1001",
                    product_name="Paracetamol 500mg Tablets USP",
                    product_type="FDF",
                    batch_number="B-9941",
                    manufacturing_date="2026-01-15",
                    expiry_date="2028-01-14",
                    dosage_form="Tablet",
                    defect_category="Physical",
                    defect_description="Tablet surface chipping and brownish discoloration observed in 15 bottles during hospital dispensing.",
                    reporter_name="Dr. Sarah Jenkins",
                    reporter_organization="St. Jude Hospital Pharmacy",
                    reporter_contact="sjenkins@stjudehospital.org",
                    date_received="2026-07-20",
                    quantity_affected="15 Bottles",
                    severity_score=3,
                    likelihood_score=3,
                    risk_level="Major",
                    risk_justification="Physical tablet degradation or packaging integrity defect impacting product shelf-life and aesthetic quality.",
                    requires_regulatory_reporting=False,
                    regulatory_details="Internal QMS investigation required. No mandatory 3-day Field Alert.",
                    completeness_score=100.0,
                    missing_fields=[],
                    is_duplicate=False,
                    duplicate_references=[],
                    root_cause_summary="Inadequate punch tip lubrication and humidity control during tablet compression phase.",
                    five_whys=[
                        "Why did tablets chip and discolor? Surface stickiness during ejection.",
                        "Why did stickiness occur? High moisture absorption in compression suite.",
                        "Why was moisture absorption high? HVAC relative humidity sensor drifted above 55% RH target.",
                        "Why did sensor drift? Calibration frequency was missed during preventive maintenance.",
                        "Root Cause: Preventive maintenance schedule for HVAC sensor calibration was out of compliance."
                    ],
                    ishikawa_categories={
                        "Machine": ["HVAC RH sensor calibration drift", "Compression punch tip wear"],
                        "Material": ["Granulation blend moisture content at upper limit (2.8%)"],
                        "Environment": ["Compression suite relative humidity elevated to 62% RH"]
                    },
                    capa_containment="Quarantine Batch B-9941. Inspect retain samples.",
                    capa_corrective="Re-calibrate HVAC RH sensors. Replace worn punch tip tooling.",
                    capa_preventive="Mandate automated daily HVAC RH sensor cross-checks.",
                    status="Under Investigation",
                    priority="High"
                ),
                Complaint(
                    complaint_number="CMP-2026-1002",
                    product_name="Amoxicillin Trihydrate API",
                    product_type="API",
                    batch_number="A-4022",
                    manufacturing_date="2026-03-10",
                    expiry_date="2029-03-09",
                    dosage_form="Bulk Powder",
                    defect_category="Chemical",
                    defect_description="OOS related substance Impurity C peak (0.42% vs 0.15% limit) detected during raw material QC testing.",
                    reporter_name="Michael Chang",
                    reporter_organization="Apex Formulations QC Lab",
                    reporter_contact="mchang@apexformulations.com",
                    date_received="2026-07-22",
                    quantity_affected="2 Drums (100 kg)",
                    severity_score=5,
                    likelihood_score=4,
                    risk_level="Critical",
                    risk_justification="Potential patient health risk due to chemical/microbiological impurity exceeding ICH Q3A specification thresholds.",
                    requires_regulatory_reporting=True,
                    regulatory_details="FDA 3-Day Field Alert Report (FAR) / EMA Rapid Alert required under 21 CFR 211.198.",
                    completeness_score=100.0,
                    missing_fields=[],
                    is_duplicate=False,
                    duplicate_references=[],
                    root_cause_summary="Crystallization step temperature spike due to heat exchanger valve sticking.",
                    five_whys=[
                        "Why was Impurity C high? Thermal degradation during crystallization.",
                        "Why did thermal degradation occur? Reactor temperature spiked by 8°C.",
                        "Why did temperature spike? Coolant control valve stem was calcified.",
                        "Why was valve stem calcified? Chilled water glycol loop was un-serviced.",
                        "Root Cause: Maintenance delay on chiller plant coolant treatment loop."
                    ],
                    ishikawa_categories={
                        "Machine": ["Coolant control valve calcification", "Heat exchanger thermal sensor lag"],
                        "Method": ["Inadequate real-time reactor temperature alarm threshold"]
                    },
                    capa_containment="Quarantine all drums of Batch A-4022 immediately.",
                    capa_corrective="Flush and de-scale coolant control valve loop.",
                    capa_preventive="Implement automated continuous temperature logging with automatic coolant safety trip.",
                    status="CAPA Pending",
                    priority="Critical"
                )
            ]
            db.add_all(seed_complaints)
            db.commit()
            logger.info("Successfully seeded database with 2 initial complaints.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "groq_model": settings.GROQ_MODEL
    }
