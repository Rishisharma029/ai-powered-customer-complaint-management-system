import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Complaint, AuditTrail
from app.schemas import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_complaint_number() -> str:
    year = datetime.datetime.now().year
    rand_id = random.randint(1000, 9999)
    return f"CMP-{year}-{rand_id}"

@router.get("/", response_model=List[ComplaintResponse])
def list_complaints(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if search:
        query = query.filter(
            (Complaint.product_name.ilike(f"%{search}%")) |
            (Complaint.batch_number.ilike(f"%{search}%")) |
            (Complaint.complaint_number.ilike(f"%{search}%")) |
            (Complaint.defect_category.ilike(f"%{search}%"))
        )
    if status and status != "All":
        query = query.filter(Complaint.status == status)
    if risk_level and risk_level != "All":
        query = query.filter(Complaint.risk_level == risk_level)
        
    return query.order_by(Complaint.id.desc()).all()

@router.post("/", response_model=ComplaintResponse)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    comp_num = generate_complaint_number()
    db_obj = Complaint(
        complaint_number=comp_num,
        **payload.model_dump()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Audit Trail Entry
    audit = AuditTrail(
        complaint_number=comp_num,
        action="LOGGED",
        performed_by="QMS User / AI Copilot",
        details=f"Logged customer complaint for {db_obj.product_name} (Batch: {db_obj.batch_number}). Risk Level: {db_obj.risk_level}."
    )
    db.add(audit)
    db.commit()
    
    return db_obj

@router.get("/analytics/kpis")
def get_analytics_kpis(db: Session = Depends(get_db)):
    total = db.query(Complaint).count()
    critical = db.query(Complaint).filter(Complaint.risk_level == "Critical").count()
    regulatory_alerts = db.query(Complaint).filter(Complaint.requires_regulatory_reporting == True).count()
    under_investigation = db.query(Complaint).filter(Complaint.status == "Under Investigation").count()
    
    # Category distribution
    categories = db.query(
        Complaint.defect_category, func.count(Complaint.id)
    ).group_by(Complaint.defect_category).all()
    
    cat_data = {cat: count for cat, count in categories}
    
    return {
        "total_complaints": total,
        "critical_complaints": critical,
        "regulatory_field_alerts": regulatory_alerts,
        "under_investigation": under_investigation,
        "defect_categories": cat_data
    }

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return comp
