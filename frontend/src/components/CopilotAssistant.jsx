import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, Edit3, FileText, Send, Upload, Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { setRawInputText, setEditPromptText, setActiveTool, setSampleId, analyzeComplaintAsync, editComplaintAsync, uploadDocumentAsync, addCopilotMessage } from '../store/copilotSlice';
import { populateFromAI } from '../store/formSlice';
import LangGraphVisualizer from './LangGraphVisualizer';
import RCACapaViewer from './RCACapaViewer';

const SAMPLES = [
  {
    id: 'tablet_chipping',
    title: 'Paracetamol Tablet Chipping',
    badge: 'FDF Physical',
    color: '#3b82f6'
  },
  {
    id: 'api_impurity',
    title: 'Amoxicillin API Impurity OOS',
    badge: 'API Chemical',
    color: '#ef4444'
  },
  {
    id: 'packaging_leak',
    title: 'Metformin Packaging Foil Leak',
    badge: 'Packaging',
    color: '#eab308'
  }
];

export default function CopilotAssistant() {
  const dispatch = useDispatch();
  const { activeTool, rawInputText, editPromptText, isAnalyzing, analysisError, copilotMessages } = useSelector((state) => state.copilot);
  const formState = useSelector((state) => state.form);

  const handleToolChange = (tool) => {
    dispatch(setActiveTool(tool));
  };

  // Tool 1: Log Complaint Tool
  const handleRunLogTool = () => {
    if (!rawInputText.trim()) return;
    dispatch(addCopilotMessage({ sender: 'user', text: `📝 **Log Complaint Tool Prompt:**\n${rawInputText}` }));
    
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

  // Tool 2: Edit Complaint Tool (Natural language modification preserving existing data)
  const handleRunEditTool = () => {
    if (!editPromptText.trim()) return;
    dispatch(addCopilotMessage({ sender: 'user', text: `✏️ **Edit Complaint Tool Prompt:**\n${editPromptText}` }));

    dispatch(editComplaintAsync({ current_form_state: formState, edit_prompt: editPromptText }))
      .unwrap()
      .then((res) => {
        dispatch(populateFromAI({
          extracted: res.extracted_fields,
          risk: res.risk_assessment,
          rca: res.root_cause,
          capa: res.capa_recommendations
        }));
      });
  };

  // Tool 3: Sample Click
  const handleSampleClick = (sampleId) => {
    dispatch(setSampleId(sampleId));
    dispatch(addCopilotMessage({ sender: 'user', text: `📄 **Document Extraction Tool:** Loaded realistic sample file (${sampleId})` }));

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

  // Tool 3: Upload File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(addCopilotMessage({ sender: 'user', text: `📄 **Document Extraction Tool:** Uploaded file ${file.name}` }));
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

  return (
    <div className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Copilot Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', padding: '0.4rem', borderRadius: '8px' }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>AIVOA Co-Pilot AI Assistant</h2>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>Fills & updates the Complaint Form on the left automatically</p>
          </div>
        </div>
        <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
          LangGraph + Groq LLM
        </span>
      </div>

      {/* Mandatory 3 AI Tool Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginBottom: '1rem', background: '#0f172a', padding: '0.3rem', borderRadius: '8px', border: '1px solid #334155' }}>
        <button
          onClick={() => handleToolChange('log')}
          style={{
            background: activeTool === 'log' ? '#1e293b' : 'transparent',
            color: activeTool === 'log' ? '#60a5fa' : '#94a3b8',
            border: activeTool === 'log' ? '1px solid #334155' : '1px solid transparent',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <Sparkles size={14} /> 1. Log Tool
        </button>

        <button
          onClick={() => handleToolChange('edit')}
          style={{
            background: activeTool === 'edit' ? '#1e293b' : 'transparent',
            color: activeTool === 'edit' ? '#60a5fa' : '#94a3b8',
            border: activeTool === 'edit' ? '1px solid #334155' : '1px solid transparent',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <Edit3 size={14} /> 2. Edit Tool
        </button>

        <button
          onClick={() => handleToolChange('doc')}
          style={{
            background: activeTool === 'doc' ? '#1e293b' : 'transparent',
            color: activeTool === 'doc' ? '#60a5fa' : '#94a3b8',
            border: activeTool === 'doc' ? '1px solid #334155' : '1px solid transparent',
            padding: '0.45rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.3rem'
          }}
        >
          <FileText size={14} /> 3. Document Tool
        </button>
      </div>

      {/* TOOL 1 INTERFACE: Log Complaint Tool */}
      {activeTool === 'log' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
            📝 LOG COMPLAINT PROMPT (ChatGPT-style Auto-Extraction & Risk Assessment):
          </label>
          <textarea
            rows={4}
            value={rawInputText}
            onChange={(e) => dispatch(setRawInputText(e.target.value))}
            placeholder="e.g. Received customer complaint on July 20th from Dr. Jenkins at St. Jude Hospital regarding Paracetamol 500mg Tablets (Batch B-9941). Observed 20% tablet chipping and brown discoloration..."
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
          />
          <button
            onClick={handleRunLogTool}
            disabled={isAnalyzing || !rawInputText.trim()}
            className="btn-primary"
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Sparkles size={16} />}
            <span>Log Complaint & Populate Left Form</span>
          </button>
        </div>
      )}

      {/* TOOL 2 INTERFACE: Edit Complaint Tool */}
      {activeTool === 'edit' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
            ✏️ EDIT COMPLAINT PROMPT (Updates form while strictly preserving existing data):
          </label>
          <textarea
            rows={4}
            value={editPromptText}
            onChange={(e) => dispatch(setEditPromptText(e.target.value))}
            placeholder="e.g. Change batch number to B-9942 and escalate severity to Critical because 3 patients experienced adverse reactions..."
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
          />
          <button
            onClick={handleRunEditTool}
            disabled={isAnalyzing || !editPromptText.trim()}
            className="btn-primary"
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            {isAnalyzing ? <RefreshCw className="spin" size={16} /> : <Edit3 size={16} />}
            <span>Apply Natural Language Edit to Form</span>
          </button>
        </div>
      )}

      {/* TOOL 3 INTERFACE: Document Extraction Tool */}
      {activeTool === 'doc' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
            📄 DOCUMENT EXTRACTION TOOL (Upload PDF/Email or load sample):
          </label>
          
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleClick(sample.id)}
                disabled={isAnalyzing}
                style={{
                  background: '#0f172a',
                  border: `1px solid ${sample.color}`,
                  color: '#fff',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {sample.title}
              </button>
            ))}
          </div>

          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8', background: '#0f172a', border: '1px dashed #334155', padding: '0.8rem', borderRadius: '8px', width: '100%' }}>
            <Upload size={16} color="#60a5fa" />
            <span>Upload Complaint PDF / Email Document</span>
            <input type="file" accept=".pdf,.txt,.eml" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {analysisError && (
        <div style={{ marginBottom: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={14} />
          <span>{analysisError}</span>
        </div>
      )}

      {/* LangGraph Agent Node Visualizer */}
      <LangGraphVisualizer />

      {/* AI Assistant Chat Stream History */}
      <div style={{ flex: 1, minHeight: '200px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.8rem', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>AIVOA Copilot Chat Activity Stream</span>
        {copilotMessages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: msg.sender === 'user' ? '#334155' : '#1e3a8a', padding: '0.3rem', borderRadius: '6px', flexShrink: 0 }}>
              {msg.sender === 'user' ? <User size={14} color="#fff" /> : <Bot size={14} color="#60a5fa" />}
            </div>
            <div style={{ background: msg.sender === 'user' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(30, 58, 138, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#f8fafc', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* RCA & CAPA Recommendations */}
      <RCACapaViewer />

    </div>
  );
}
