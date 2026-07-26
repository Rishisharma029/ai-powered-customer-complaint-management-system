import React from 'react';
import { useSelector } from 'react-redux';
import { Copy, AlertTriangle, CheckCircle2, History } from 'lucide-react';

export default function DuplicateDetectionCard() {
  const { duplicates } = useSelector((state) => state.copilot);

  if (!duplicates) return null;

  const isDuplicate = duplicates.is_duplicate;
  const count = duplicates.duplicate_count || 0;
  const list = duplicates.details || [];

  return (
    <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', border: isDuplicate ? '1px solid #f97316' : '1px solid #334155' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <History size={18} color={isDuplicate ? '#f97316' : '#34d399'} />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Duplicate Complaint & Batch History Check</h4>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: isDuplicate ? 'rgba(249, 115, 22, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: isDuplicate ? '#fdba74' : '#86efac', border: isDuplicate ? '1px solid #f97316' : '1px solid #22c55e' }}>
          {isDuplicate ? `⚠️ ${count} Related Complaint(s) Found` : '✓ No Duplicate Batch Records'}
        </span>
      </div>

      {isDuplicate ? (
        <div>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.6rem' }}>
            The AI Copilot cross-referenced the batch number and product name against the historical QMS database and identified existing related complaints:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {list.map((item, idx) => (
              <div key={idx} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>{item.complaint_number}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.6rem' }}>{item.product_name} (Batch: {item.batch_number})</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#fdba74', background: 'rgba(249, 115, 22, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  {item.similarity_reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
          This complaint appears to be an isolated incident. No matching historical complaints were found for this specific batch or product line.
        </p>
      )}
    </div>
  );
}
