import { createSlice } from '@reduxjs/toolkit';

const initialFormState = {
  product_name: '',
  product_type: 'FDF',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  dosage_form: 'Tablet',
  defect_category: 'Physical',
  defect_description: '',
  reporter_name: '',
  reporter_organization: '',
  reporter_contact: '',
  date_received: new Date().toISOString().split('T')[0],
  quantity_affected: '',
  severity_score: 1,
  likelihood_score: 1,
  risk_level: 'Low',
  risk_justification: '',
  requires_regulatory_reporting: false,
  regulatory_details: '',
  completeness_score: 100,
  missing_fields: [],
  is_duplicate: false,
  duplicate_references: [],
  root_cause_summary: '',
  five_whys: [],
  ishikawa_categories: {},
  capa_containment: '',
  capa_corrective: '',
  capa_preventive: '',
  status: 'Under Investigation',
  priority: 'Medium'
};

const formSlice = createSlice({
  name: 'form',
  initialState: initialFormState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    populateFromAI: (state, action) => {
      const { extracted, risk, completeness, duplicates, rca, capa } = action.payload;
      
      if (extracted) {
        state.product_name = extracted.product_name || state.product_name;
        state.product_type = extracted.product_type || state.product_type;
        state.batch_number = extracted.batch_number || state.batch_number;
        state.manufacturing_date = extracted.manufacturing_date || state.manufacturing_date;
        state.expiry_date = extracted.expiry_date || state.expiry_date;
        state.dosage_form = extracted.dosage_form || state.dosage_form;
        state.defect_category = extracted.defect_category || state.defect_category;
        state.defect_description = extracted.defect_description || state.defect_description;
        state.reporter_name = extracted.reporter_name || state.reporter_name;
        state.reporter_organization = extracted.reporter_organization || state.reporter_organization;
        state.reporter_contact = extracted.reporter_contact || state.reporter_contact;
        state.date_received = extracted.date_received || state.date_received;
        state.quantity_affected = extracted.quantity_affected || state.quantity_affected;
      }
      
      if (risk) {
        state.severity_score = risk.severity_score || 1;
        state.likelihood_score = risk.likelihood_score || 1;
        state.risk_level = risk.risk_level || 'Low';
        state.risk_justification = risk.risk_justification || '';
        state.requires_regulatory_reporting = risk.requires_regulatory_reporting || false;
        state.regulatory_details = risk.regulatory_details || '';
        state.priority = risk.risk_level === 'Critical' ? 'Critical' : (risk.risk_level === 'Major' ? 'High' : 'Medium');
      }
      
      if (completeness) {
        state.completeness_score = completeness.completeness_score || 100;
        state.missing_fields = completeness.missing_fields || [];
      }
      
      if (duplicates) {
        state.is_duplicate = duplicates.is_duplicate || false;
        state.duplicate_references = duplicates.references || [];
      }
      
      if (rca) {
        state.root_cause_summary = rca.root_cause_summary || '';
        state.five_whys = rca.five_whys || [];
        state.ishikawa_categories = rca.ishikawa_categories || {};
      }
      
      if (capa) {
        state.capa_containment = capa.capa_containment || '';
        state.capa_corrective = capa.capa_corrective || '';
        state.capa_preventive = capa.capa_preventive || '';
      }
    },
    resetForm: () => initialFormState
  }
});

export const { updateFormField, populateFromAI, resetForm } = formSlice.actions;
export default formSlice.reducer;
