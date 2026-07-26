import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { setRawInputText, setSampleId, analyzeComplaintAsync, uploadDocumentAsync } from '../store/copilotSlice';
import { populateFromAI } from '../store/formSlice';

const SAMPLE_LIST = [
  {
    id: 'tablet_chipping',
    title: 'Paracetamol 500mg Tablet Chipping',
    badge: 'FDF Physical Defect',
    color: '#3b82f6'
  },
  {
    id: 'api_impurity',
    title: 'Amoxicillin API OOS Impurity Peak',
    badge: 'API Chemical Defect',
    color: '#ef4444'
  },
  {
    id: 'packaging_leak',
    title: 'Metformin Blister Foil Seal Leak',
    badge: 'Packaging Integrity',
    color: '#eab308'
  }
];

export default function IngestionPanel() {
  const dispatch = useDispatch();
  const { rawInputText, isAnalyzing, analysisError } = useSelector((state) => state.copilot);
  const [activeSample, setActiveSample] = useState(null);

  const handleTextChange = (e) => {
    dispatch(setRawInputText(e.target.value));
    setActiveSample(null);
  };

  const handleSelectSample = (sampleId) => {
    setActiveSample(sampleId);
    dispatch(setSampleId(sampleId));
    // Trigger instant analysis for sample
    dispatch(analyzeComplaintAsync({ sample_id: sampleId }))
      .unwrap()
      .then((res) => {
        dispatch(populateFromAI({
          extracted: res.extracted_fields,
          risk: res.risk_assessment,
          completeness: res.completeness,
          duplicates: res.duplicates,
          rca: res.root_cause,
          capa: res.capa_recommendations
        }));
      });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(uploadDocumentAsync(file))
        .unwrap()
        .then((res) => {
          dispatch(populateFromAI({
            extracted: res.extracted_fields,
            risk: res.risk_assessment,
            completeness: res.completeness,
            duplicates: res.duplicates,
            rca: res.root_cause,
            capa: res.capa_recommendations
          }));
        });
    }
  };

  const handleRunAnalysis = () => {
    if (!rawInputText.trim()) return;
    dispatch(analyzeComplaintAsync({ raw_text: rawInputText }))
      .unwrap()
      .then((res) => {
        dispatch(populateFromAI({
          extracted: res.extracted_fields,
          risk: res.risk_assessment,
          completeness: res.completeness,
          duplicates: res.duplicates,
          rca: res.root_cause,
          capa: res.capa_recommendations
        }));
      });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <Sparkles size={18} color="#3b82f6" /> 1. Complaint Ingestion & Intake
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PDF, Email, Text Input</span>
      </div>

      {/* Preset Sample Buttons */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
          LOAD REALISTIC PHARMA SAMPLES:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_LIST.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              disabled={isAnalyzing}
              style={{
                background: activeSample === sample.id ? 'rgba(59, 130, 246, 0.2)' : '#0f172a',
                border: activeSample === sample.id ? `1px solid ${sample.color}` : '1px solid #334155',
                color: '#f8fafc',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sample.color }} />
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Raw Text Input */}
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          rows={5}
          value={rawInputText}
          onChange={handleTextChange}
          placeholder="Paste customer complaint email, phone transcript, hospital incident report, or API quality issue..."
          style={{
            width: '100%',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '0.8rem',
            color: '#f8fafc',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      </div>

      {/* Upload & Run Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Document Upload Button */}
        <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', background: '#0f172a', border: '1px solid #334155', padding: '0.5rem 0.9rem', borderRadius: '6px' }}>
          <Upload size={16} color="#60a5fa" />
          <span>Upload PDF / EML Document</span>
          <input type="file" accept=".pdf,.txt,.eml" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        {/* Execute Analysis Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !rawInputText.trim()}
          className="btn-primary"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Running LangGraph AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze with AI Copilot</span>
            </>
          )}
        </button>

      </div>

      {analysisError && (
        <div style={{ marginTop: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.6rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={16} />
          <span>{analysisError}</span>
        </div>
      )}
    </div>
  );
}
