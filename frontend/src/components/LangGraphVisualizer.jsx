import React from 'react';
import { useSelector } from 'react-redux';
import { Network, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const NODES_DEFINITION = [
  { id: 'ingest', label: 'Ingestion Node', desc: 'Parses PDF & prompt entities' },
  { id: 'completeness', label: 'Completeness Node', desc: 'Checks mandatory QMS fields' },
  { id: 'duplicate', label: 'Duplicate Check', desc: 'Queries historical batch records' },
  { id: 'risk', label: 'Risk Rating Node', desc: 'Severity x Likelihood & FDA Alert' },
  { id: 'rca', label: 'Root Cause Node', desc: '5-Whys & Ishikawa Fishbone' },
  { id: 'capa', label: 'CAPA Generator', desc: 'Containment & Preventive plan' },
  { id: 'summary', label: 'Payload Summary', desc: 'Form auto-population payload' }
];

export default function LangGraphVisualizer() {
  const { isAnalyzing, activeNodeStep, graphTrace } = useSelector((state) => state.copilot);

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Network size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>LangGraph Execution Agent Graph</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: isAnalyzing ? '#60a5fa' : '#34d399', fontWeight: 600 }}>
          {isAnalyzing ? '⚡ Agent Graph Executing...' : (graphTrace.length > 0 ? '✓ Graph Completed (7/7 Nodes)' : 'Standby')}
        </span>
      </div>

      {/* Workflow Horizontal Graph Nodes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', padding: '0.5rem 0', gap: '0.3rem' }}>
        {NODES_DEFINITION.map((node, idx) => {
          const nodeNum = idx + 1;
          const isDone = graphTrace.length >= nodeNum || activeNodeStep > nodeNum;
          const isActive = isAnalyzing && activeNodeStep === nodeNum;

          return (
            <React.Fragment key={node.id}>
              <div
                className={isActive ? 'node-active' : ''}
                style={{
                  flex: 1,
                  minWidth: '130px',
                  background: isDone ? 'rgba(52, 211, 153, 0.1)' : '#0f172a',
                  border: isDone ? '1px solid #059669' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '0.6rem 0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                  {isDone ? (
                    <CheckCircle size={14} color="#34d399" />
                  ) : isActive ? (
                    <Clock size={14} color="#60a5fa" />
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>#{nodeNum}</span>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDone ? '#34d399' : (isActive ? '#60a5fa' : '#f8fafc') }}>
                    {node.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, lineHeight: 1.2 }}>
                  {node.desc}
                </p>
              </div>

              {idx < NODES_DEFINITION.length - 1 && (
                <ArrowRight size={14} color={isDone ? '#059669' : '#334155'} style={{ flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
