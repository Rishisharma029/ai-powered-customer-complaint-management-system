import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileEdit, Save, CheckCircle2, AlertTriangle, PlusCircle, Package, User } from 'lucide-react';
import { updateFormField, resetForm } from '../store/formSlice';
import { resetCopilotState } from '../store/copilotSlice';
import { saveComplaintAsync, fetchComplaintsAsync, fetchKPIsAsync } from '../store/complaintSlice';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const formState = useSelector((state) => state.form);
  const { completeness } = useSelector((state) => state.copilot);
  const { isLoading, saveSuccess } = useSelector((state) => state.complaints);

  const missingFields = completeness?.missing_fields || [];

  // A field is ONLY missing if formState[fieldKey] is empty/blank AND it is in missingFields
  const isMissing = (fieldKey, label) => {
    const val = formState[fieldKey];
    if (val && String(val).trim() !== "" && String(val).trim().toLowerCase() !== "null") {
      return false;
    }
    return missingFields.some(m => m.toLowerCase().includes(label.toLowerCase()));
  };

  const handleChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleResetAll = () => {
    dispatch(resetForm());
    dispatch(resetCopilotState());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(saveComplaintAsync(formState))
      .unwrap()
      .then(() => {
        dispatch(fetchComplaintsAsync());
        dispatch(fetchKPIsAsync());
      });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.6rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <FileEdit size={18} color="#3b82f6" /> 2. Log Customer Complaint Form
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleResetAll}
            style={{
              background: '#0f172a',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <PlusCircle size={14} /> Clear / New Form
          </button>
          <span style={{ fontSize: '0.75rem', background: '#0f172a', border: '1px solid #334155', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#94a3b8' }}>
            Auto-Populated by AI
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#86efac', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={18} />
          <span>Complaint successfully saved and logged into QMS Database!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Product & Batch Identification */}
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Package size={14} /> Product & Batch Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: isMissing('product_name', 'product') ? '#fca5a5' : '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Product Name * {isMissing('product_name', 'product') && <span style={{ color: '#ef4444', fontWeight: 700 }}>(Missing)</span>}
              </label>
              <input
                type="text"
                value={formState.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="Required (e.g. Cefixime 200mg)"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: isMissing('product_name', 'product') ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Product Type *</label>
              <select
                value={formState.product_type}
                onChange={(e) => handleChange('product_type', e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="FDF">FDF (Finished Dosage Form)</option>
                <option value="API">API (Active Ingredient)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: isMissing('batch_number', 'batch') ? '#fca5a5' : '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Batch / Lot No. * {isMissing('batch_number', 'batch') && <span style={{ color: '#ef4444', fontWeight: 700 }}>(Missing)</span>}
              </label>
              <input
                type="text"
                value={formState.batch_number}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                placeholder="Required (e.g. B-9941)"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: isMissing('batch_number', 'batch') ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginTop: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Dosage Form</label>
              <input
                type="text"
                value={formState.dosage_form}
                onChange={(e) => handleChange('dosage_form', e.target.value)}
                placeholder="e.g. Tablet, Capsule"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Mfg. Date</label>
              <input
                type="text"
                value={formState.manufacturing_date}
                onChange={(e) => handleChange('manufacturing_date', e.target.value)}
                placeholder="YYYY-MM-DD"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Expiry Date</label>
              <input
                type="text"
                value={formState.expiry_date}
                onChange={(e) => handleChange('expiry_date', e.target.value)}
                placeholder="YYYY-MM-DD"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Defect Classification & Details */}
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertTriangle size={14} /> Defect Category & Description
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Defect Category *</label>
              <select
                value={formState.defect_category}
                onChange={(e) => handleChange('defect_category', e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="Physical">Physical (Chipping, Color, Friability)</option>
                <option value="Chemical">Chemical (OOS Impurity, Assay, Dissolution)</option>
                <option value="Packaging">Packaging (Unsealed Blister, Damaged Bottle)</option>
                <option value="Labeling">Labeling / Misbranding</option>
                <option value="Contamination">Microbiological / Particulate Contamination</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: isMissing('quantity_affected', 'quantity') ? '#fca5a5' : '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Quantity Affected {isMissing('quantity_affected', 'quantity') && <span style={{ color: '#ef4444', fontWeight: 700 }}>(Missing)</span>}
              </label>
              <input
                type="text"
                value={formState.quantity_affected}
                onChange={(e) => handleChange('quantity_affected', e.target.value)}
                placeholder="e.g. 15 Bottles (1,500 Tablets)"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: isMissing('quantity_affected', 'quantity') ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Detailed Defect Description *</label>
            <textarea
              rows={3}
              required
              value={formState.defect_description}
              onChange={(e) => handleChange('defect_description', e.target.value)}
              placeholder="Describe the complaint observation..."
              style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section 3: Reporter & Intaking Information */}
        <div style={{ marginBottom: '1.2rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <User size={14} /> Reporter Contact Info
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: isMissing('reporter_name', 'reporter') ? '#fca5a5' : '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Reporter Name {isMissing('reporter_name', 'reporter') && <span style={{ color: '#ef4444', fontWeight: 700 }}>(Missing)</span>}
              </label>
              <input
                type="text"
                value={formState.reporter_name}
                onChange={(e) => handleChange('reporter_name', e.target.value)}
                placeholder="Reporter Name"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: isMissing('reporter_name', 'reporter') ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Organization</label>
              <input
                type="text"
                value={formState.reporter_organization}
                onChange={(e) => handleChange('reporter_organization', e.target.value)}
                placeholder="Organization"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#fff', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: isMissing('date_received', 'date') ? '#fca5a5' : '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>
                Date Received {isMissing('date_received', 'date') && <span style={{ color: '#ef4444', fontWeight: 700 }}>(Missing)</span>}
              </label>
              <input
                type="text"
                value={formState.date_received}
                onChange={(e) => handleChange('date_received', e.target.value)}
                placeholder="YYYY-MM-DD"
                style={{
                  width: '100%',
                  background: '#0f172a',
                  border: isMissing('date_received', 'date') ? '1px solid #ef4444' : '1px solid #334155',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid #334155', paddingTop: '0.8rem' }}>
          <button type="button" onClick={handleResetAll} className="btn-secondary">
            Reset Form
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            <Save size={16} />
            <span>{isLoading ? 'Saving Complaint...' : 'Save & Submit to QMS Database'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
