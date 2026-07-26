import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, AlertOctagon, ShieldAlert, CheckCircle, PieChart, TrendingUp, Layers } from 'lucide-react';
import { fetchKPIsAsync } from '../store/complaintSlice';

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { kpis } = useSelector((state) => state.complaints);

  useEffect(() => {
    dispatch(fetchKPIsAsync());
  }, [dispatch]);

  const total = kpis?.total_complaints || 0;
  const critical = kpis?.critical_complaints || 0;
  const fieldAlerts = kpis?.regulatory_field_alerts || 0;
  const activeInvest = kpis?.under_investigation || 0;
  const categories = kpis?.defect_categories || {};

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={22} color="#3b82f6" /> QMS Quality & Risk Analytics
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Real-time complaint severity distribution, regulatory risk exposure, and defect pareto analysis.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL COMPLAINTS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>{total}</div>
          <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
            <TrendingUp size={12} /> Logged in QMS Database
          </span>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #ef4444', borderRadius: '10px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 600 }}>CRITICAL RISK ISSUES</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>{critical}</div>
          <span style={{ fontSize: '0.7rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
            <AlertOctagon size={12} /> Patient Safety Concern
          </span>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #f97316', borderRadius: '10px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#fdba74', fontWeight: 600 }}>FDA 3-DAY FIELD ALERTS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f97316', marginTop: '0.2rem' }}>{fieldAlerts}</div>
          <span style={{ fontSize: '0.7rem', color: '#fdba74', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
            <ShieldAlert size={12} /> Regulatory Notifications
          </span>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '10px', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>UNDER INVESTIGATION</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>{activeInvest}</div>
          <span style={{ fontSize: '0.7rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.3rem' }}>
            <Layers size={12} /> Active RCA / CAPA Workflow
          </span>
        </div>

      </div>

      {/* Category Breakdown */}
      <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.2rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: '#60a5fa' }}>
          Defect Category Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {Object.entries(categories).map(([cat, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cat}</span>
                  <span style={{ color: '#94a3b8' }}>{count} complaints ({pct}%)</span>
                </div>
                <div style={{ width: '100%', background: '#1e293b', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', height: '100%', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
