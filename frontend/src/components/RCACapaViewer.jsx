import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GitBranch, Wrench, ShieldCheck, HelpCircle, Layers, CheckSquare } from 'lucide-react';

export default function RCACapaViewer() {
  const { rootCause, capaRecommendations } = useSelector((state) => state.copilot);
  const [activeTab, setActiveTab] = useState('5whys'); // 5whys, ishikawa, capa

  if (!rootCause && !capaRecommendations) return null;

  const fiveWhys = rootCause?.five_whys || [];
  const ishikawa = rootCause?.ishikawa_categories || {};
  const summary = rootCause?.root_cause_summary || '';

  return (
    <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '1rem' }}>
      
      {/* Header Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.6rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GitBranch size={18} color="#3b82f6" /> AI Root Cause Analysis (RCA) & CAPA Recommendations
        </h3>
        
        <div style={{ display: 'flex', gap: '0.3rem', background: '#0f172a', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
          <button
            onClick={() => setActiveTab('5whys')}
            style={{
              background: activeTab === '5whys' ? '#1e293b' : 'transparent',
              color: activeTab === '5whys' ? '#60a5fa' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.7rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            5-Whys Tree
          </button>
          <button
            onClick={() => setActiveTab('ishikawa')}
            style={{
              background: activeTab === 'ishikawa' ? '#1e293b' : 'transparent',
              color: activeTab === 'ishikawa' ? '#60a5fa' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.7rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Ishikawa Fishbone
          </button>
          <button
            onClick={() => setActiveTab('capa')}
            style={{
              background: activeTab === 'capa' ? '#1e293b' : 'transparent',
              color: activeTab === 'capa' ? '#60a5fa' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.7rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            CAPA Action Plan
          </button>
        </div>
      </div>

      {/* Root Cause Summary Header */}
      {summary && (
        <div style={{ background: '#0f172a', borderLeft: '4px solid #3b82f6', padding: '0.6rem 0.8rem', borderRadius: '4px', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Identified Primary Root Cause:</span>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', margin: '0.2rem 0 0 0' }}>{summary}</p>
        </div>
      )}

      {/* TAB 1: 5-Whys Tree */}
      {activeTab === '5whys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {fiveWhys.map((statement, idx) => (
            <div
              key={idx}
              style={{
                background: idx === fiveWhys.length - 1 ? 'rgba(59, 130, 246, 0.15)' : '#0f172a',
                border: idx === fiveWhys.length - 1 ? '1px solid #3b82f6' : '1px solid #334155',
                borderRadius: '6px',
                padding: '0.6rem 0.8rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                marginLeft: `${idx * 12}px`
              }}
            >
              <span style={{ background: '#1e293b', color: '#60a5fa', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', flexShrink: 0 }}>
                Why #{idx + 1}
              </span>
              <span style={{ fontSize: '0.8rem', color: idx === fiveWhys.length - 1 ? '#60a5fa' : '#cbd5e1', fontWeight: idx === fiveWhys.length - 1 ? 700 : 400 }}>
                {statement}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Ishikawa Fishbone Categories */}
      {activeTab === 'ishikawa' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
          {Object.entries(ishikawa).map(([category, factors]) => (
            <div key={category} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.7rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.4rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.2rem' }}>
                {category}
              </h4>
              {factors && factors.length > 0 ? (
                <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                  {factors.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>{f}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>No contributing factor</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CAPA Recommendations */}
      {activeTab === 'capa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '0.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> Immediate Containment Action
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#f8fafc', margin: 0 }}>
              {capaRecommendations?.capa_containment || 'Quarantine affected batch and inspect stock.'}
            </p>
          </div>

          <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '8px', padding: '0.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fdba74', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Wrench size={14} /> Corrective Action (Fix Issue)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#f8fafc', margin: 0 }}>
              {capaRecommendations?.capa_corrective || 'Repair/re-calibrate equipment and replace tooling.'}
            </p>
          </div>

          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.4)', borderRadius: '8px', padding: '0.75rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#86efac', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckSquare size={14} /> Preventive Action (Systemic Recurrence Prevention)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#f8fafc', margin: 0 }}>
              {capaRecommendations?.capa_preventive || 'Update SOPs and implement automated sensors.'}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
