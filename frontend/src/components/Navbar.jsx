import React from 'react';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Cpu, PlusCircle, Sparkles, FileText, BarChart3 } from 'lucide-react';
import { resetForm } from '../store/formSlice';
import { resetCopilotState } from '../store/copilotSlice';

export default function Navbar({ activeView, setActiveView }) {
  const dispatch = useDispatch();

  const handleNewComplaintClick = () => {
    dispatch(resetForm());
    dispatch(resetCopilotState());
    setActiveView('ingest');
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '0.8rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Brand Logo & QMS Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', padding: '0.55rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', tracking: '-0.02em', margin: 0 }}>
                AIVOA QMS Copilot
              </h1>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid #3b82f6', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                Pharma API & FDF
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              AI-Powered Customer Complaint Management • 21 CFR Part 211 / EU GMP Compliant
            </p>
          </div>
        </div>

        {/* View Selector Tabs & New Complaint Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          
          <button
            onClick={handleNewComplaintClick}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <PlusCircle size={18} /> New Complaint (+)
          </button>

          <nav style={{ display: 'flex', gap: '0.5rem', background: '#0f172a', padding: '0.3rem', borderRadius: '10px', border: '1px solid #334155' }}>
            <button
              onClick={() => setActiveView('ingest')}
              style={{
                background: activeView === 'ingest' ? '#1e293b' : 'transparent',
                color: activeView === 'ingest' ? '#60a5fa' : '#94a3b8',
                border: activeView === 'ingest' ? '1px solid #334155' : '1px solid transparent',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={16} /> Log & AI Copilot
            </button>
            
            <button
              onClick={() => setActiveView('list')}
              style={{
                background: activeView === 'list' ? '#1e293b' : 'transparent',
                color: activeView === 'list' ? '#60a5fa' : '#94a3b8',
                border: activeView === 'list' ? '1px solid #334155' : '1px solid transparent',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} /> Complaint Records
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              style={{
                background: activeView === 'analytics' ? '#1e293b' : 'transparent',
                color: activeView === 'analytics' ? '#60a5fa' : '#94a3b8',
                border: activeView === 'analytics' ? '1px solid #334155' : '1px solid transparent',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <BarChart3 size={16} /> QMS Analytics
            </button>
          </nav>
        </div>

        {/* AI Model Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
              <Cpu size={14} color="#10b981" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>LangGraph + Groq LLM</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Model: gemma2-9b-it</span>
          </div>
        </div>

      </div>
    </header>
  );
}
