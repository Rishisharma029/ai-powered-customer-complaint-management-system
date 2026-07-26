import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True) # e.g. CMP-2026-0041
    product_name = Column(String(200), index=True)
    product_type = Column(String(50)) # "FDF" (Finished Dosage Form) or "API" (Active Pharmaceutical Ingredient)
    batch_number = Column(String(100), index=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    dosage_form = Column(String(100), nullable=True) # e.g., Tablet, Capsule, Injectable, Bulk Powder
    defect_category = Column(String(100), index=True) # Physical, Chemical, Packaging, Labeling, Contamination, Stability
    defect_description = Column(Text)
    reporter_name = Column(String(150), nullable=True)
    reporter_organization = Column(String(200), nullable=True) # e.g., City General Hospital, Wholesale Distributor
    reporter_contact = Column(String(100), nullable=True)
    date_received = Column(String(50))
    quantity_affected = Column(String(100), nullable=True)
    
    # Risk Assessment
    severity_score = Column(Integer, default=1) # 1 (Minor) to 5 (Critical/Life-Threatening)
    likelihood_score = Column(Integer, default=1) # 1 (Rare) to 5 (Frequent)
    risk_level = Column(String(50), default="Low") # Low, Medium, High, Critical
    risk_justification = Column(Text, nullable=True)
    requires_regulatory_reporting = Column(Boolean, default=False) # e.g., FDA 3-Day Field Alert / EMA Alert
    regulatory_details = Column(Text, nullable=True)
    
    # QMS Analysis
    completeness_score = Column(Float, default=100.0) # Percentage completeness
    missing_fields = Column(JSON, nullable=True) # Array of string field names
    is_duplicate = Column(Boolean, default=False)
    duplicate_references = Column(JSON, nullable=True) # Array of existing complaint numbers
    
    # RCA & CAPA
    root_cause_summary = Column(Text, nullable=True)
    five_whys = Column(JSON, nullable=True) # List of string statements
    ishikawa_categories = Column(JSON, nullable=True) # Dict of fishbone categories: Man, Machine, Material, Method, Measurement, Environment
    capa_containment = Column(Text, nullable=True)
    capa_corrective = Column(Text, nullable=True)
    capa_preventive = Column(Text, nullable=True)
    
    status = Column(String(50), default="Under Investigation") # Logged, Under Investigation, CAPA Pending, Closed
    priority = Column(String(50), default="Medium") # Low, Medium, High, Critical
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AuditTrail(Base):
    __tablename__ = "audit_trails"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), index=True)
    action = Column(String(100)) # e.g., INGESTED, AI_ANALYZED, LOGGED, CAPA_UPDATED, CLOSED
    performed_by = Column(String(100), default="AI Copilot Agent")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details = Column(Text, nullable=True)
