import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, ShieldAlert, FileText, ChevronRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchComplaintsAsync, setSearchQuery, setStatusFilter, setRiskFilter, setActiveComplaint } from '../store/complaintSlice';

export default function ComplaintsList() {
  const dispatch = useDispatch();
  const { items, isLoading, searchQuery, statusFilter, riskFilter, activeComplaint } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchComplaintsAsync({ search: searchQuery, status: statusFilter, risk_level: riskFilter }));
  }, [dispatch, searchQuery, statusFilter, riskFilter]);

  const getBadgeClass = (level) => {
    switch (level) {
      case 'Critical': return 'badge-critical';
      case 'Major': return 'badge-major';
      case 'Medium': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#3b82f6" /> QMS Customer Complaint Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Audit log of all logged pharmaceutical complaints and investigation statuses.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search product, batch, CMP#..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="CAPA Pending">CAPA Pending</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => dispatch(setRiskFilter(e.target.value))}
            style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button onClick={() => dispatch(fetchComplaintsAsync({ search: searchQuery, status: statusFilter, risk_level: riskFilter }))} className="btn-secondary" style={{ padding: '0.5rem' }}>
            <RefreshCw size={16} />
          </button>

        </div>
      </div>

      {/* Directory Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Complaint #</th>
              <th style={{ padding: '0.75rem 1rem' }}>Product Name</th>
              <th style={{ padding: '0.75rem 1rem' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem' }}>Batch #</th>
              <th style={{ padding: '0.75rem 1rem' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem' }}>Risk Level</th>
              <th style={{ padding: '0.75rem 1rem' }}>FDA Field Alert</th>
              <th style={{ padding: '0.75rem 1rem' }}>Date Received</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  Loading QMS Complaint Records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No customer complaint records found matching filters.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#60a5fa' }}>
                    {item.complaint_number}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {item.product_name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', background: item.product_type === 'API' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: item.product_type === 'API' ? '#c084fc' : '#60a5fa' }}>
                      {item.product_type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>
                    {item.batch_number}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                    {item.defect_category}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={getBadgeClass(item.risk_level)}>{item.risk_level}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {item.requires_regulatory_reporting ? (
                      <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldAlert size={14} /> YES (3-Day FAR)
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                    {item.date_received}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', background: '#334155', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button
                      onClick={() => dispatch(setActiveComplaint(item))}
                      style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                    >
                      <span>View</span> <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Active Complaint Detail Modal Drawer */}
      {activeComplaint && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', border: '1px solid #3b82f6' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.6rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>QMS RECORD FILE</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff' }}>{activeComplaint.complaint_number} - {activeComplaint.product_name}</h3>
              </div>
              <button onClick={() => dispatch(setActiveComplaint(null))} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                ✕ Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>BATCH & PRODUCT</span>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Batch: {activeComplaint.batch_number} ({activeComplaint.product_type})</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>Mfg: {activeComplaint.manufacturing_date} | Exp: {activeComplaint.expiry_date}</p>
              </div>

              <div style={{ background: '#0f172a', padding: '0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>RISK & REGULATORY ALERT</span>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }} className={getBadgeClass(activeComplaint.risk_level)}>
                  {activeComplaint.risk_level} Risk Level
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: activeComplaint.requires_regulatory_reporting ? '#ef4444' : '#34d399' }}>
                  {activeComplaint.requires_regulatory_reporting ? '⚠️ Regulatory Notification Required' : '✓ Internal QMS Only'}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Defect Description</h4>
              <p style={{ fontSize: '0.85rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px', margin: 0 }}>{activeComplaint.defect_description}</p>
            </div>

            {activeComplaint.root_cause_summary && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Root Cause Analysis (RCA)</h4>
                <p style={{ fontSize: '0.85rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px', margin: 0 }}>{activeComplaint.root_cause_summary}</p>
              </div>
            )}

            {activeComplaint.capa_containment && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.3rem' }}>CAPA Plan</h4>
                <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong style={{ color: '#fca5a5' }}>Containment:</strong> {activeComplaint.capa_containment}</div>
                  <div><strong style={{ color: '#fdba74' }}>Corrective:</strong> {activeComplaint.capa_corrective}</div>
                  <div><strong style={{ color: '#86efac' }}>Preventive:</strong> {activeComplaint.capa_preventive}</div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
