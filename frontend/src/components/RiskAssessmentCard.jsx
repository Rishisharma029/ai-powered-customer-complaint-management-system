import React from 'react';
import { useSelector } from 'react-redux';
import { AlertOctagon, ShieldAlert, CheckCircle, PieChart, FileText, AlertTriangle, XCircle } from 'lucide-react';

export default function RiskAssessmentCard() {
  const { riskAssessment, completeness, executiveSummary } = useSelector((state) => state.copilot);

  if (!riskAssessment && !completeness) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <ShieldAlert size={36} color="#475569" style={{ marginBottom: '0.5rem' }} />
        <h4 style={{ fontSize: '0.9rem', color: '#f8fafc' }}>AI Risk & Completeness Assessment Pending</h4>
        <p style={{ fontSize: '0.8rem' }}>Run AI Copilot Analysis on a complaint to view real-time QRM classification, completeness audit, and regulatory alert requirements.</p>
      </div>
    );
  }

  const riskLevel = riskAssessment?.risk_level || 'Medium';
  const severity = riskAssessment?.severity_score || 3;
  const likelihood = riskAssessment?.likelihood_score || 3;
  const isRegulatory = riskAssessment?.requires_regulatory_reporting || false;
  const completenessScore = completeness?.completeness_score || 100;
  const missingFields = completeness?.missing_fields || [];

  const getBadgeClass = (level) => {
    switch (level) {
      case 'Critical': return 'badge-critical';
      case 'Major': return 'badge-major';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertOctagon size={20} color={riskLevel === 'Critical' ? '#ef4444' : '#f97316'} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>AI Copilot Risk & Compliance Assessment</h3>
        </div>
        <span className={getBadgeClass(riskLevel)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
          {riskLevel} Risk
        </span>
      </div>

      {/* MISSING FIELDS / INCOMPLETE COMPLAINT ALERT BOX */}
      {missingFields.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span>Completeness Node Alert: Incomplete Complaint Data</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>
            The following mandatory QMS details were not provided in the input prompt and must be completed:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {missingFields.map((field, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#fca5a5', fontWeight: 600 }}>
                <XCircle size={14} color="#ef4444" />
                <span>{field}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Field Alert Banner */}
      {isRegulatory && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.85rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>CRITICAL REGULATORY ALERT: Mandatory Field Notification</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#f8fafc', marginTop: '0.3rem', margin: 0 }}>
            {riskAssessment?.regulatory_details || 'FDA 3-Day Field Alert Report (FAR) or EMA Rapid Alert required under 21 CFR 211.198 due to potential critical safety impact.'}
          </p>
        </div>
      )}

      {/* Grid Layout for Risk Matrix & Completeness */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* Risk Score & Justification */}
        <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>ICH Q9 Risk Score</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
              Severity ({severity}) × Likelihood ({likelihood}) = {severity * likelihood}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            {riskAssessment?.risk_justification || 'Quality risk assessment performed in accordance with pharma QRM protocols.'}
          </p>
        </div>

        {/* Completeness Score Gauge */}
        <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <PieChart size={14} color="#06b6d4" /> Complaint Completeness Score
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: completenessScore >= 85 ? '#34d399' : '#ef4444' }}>
              {completenessScore}%
            </span>
          </div>
          <div style={{ width: '100%', background: '#1e293b', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${completenessScore}%`, background: completenessScore >= 85 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f97316, #ef4444)', height: '100%', borderRadius: '4px' }} />
          </div>
          <p style={{ fontSize: '0.7rem', color: missingFields.length > 0 ? '#fca5a5' : '#94a3b8', marginTop: '0.4rem', margin: 0 }}>
            {completeness?.recommendation || 'All key QMS audit fields provided.'}
          </p>
        </div>

      </div>

      {/* Executive Summary Statement */}
      {executiveSummary && (
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.2rem' }}>
            <FileText size={14} /> AI Executive Summary
          </div>
          <p style={{ fontSize: '0.8rem', color: '#f8fafc', margin: 0 }}>
            {executiveSummary}
          </p>
        </div>
      )}

    </div>
  );
}
