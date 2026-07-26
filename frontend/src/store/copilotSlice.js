import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const analyzeComplaintAsync = createAsyncThunk(
  'copilot/analyzeComplaint',
  async ({ raw_text, sample_id }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/copilot/analyze`, {
        raw_text,
        sample_id
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Analysis failed');
    }
  }
);

export const editComplaintAsync = createAsyncThunk(
  'copilot/editComplaint',
  async ({ current_form_state, edit_prompt }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/copilot/edit`, {
        current_form_state,
        edit_prompt
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Edit failed');
    }
  }
);

export const uploadDocumentAsync = createAsyncThunk(
  'copilot/uploadDocument',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE}/copilot/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Document upload failed');
    }
  }
);

const initialState = {
  rawInputText: '',
  editPromptText: '',
  sampleId: null,
  activeTool: 'log', // 'log' (Log Complaint Tool), 'edit' (Edit Complaint Tool), 'doc' (Document Extraction Tool)
  isAnalyzing: false,
  analysisError: null,
  activeNodeStep: 0,
  graphTrace: [],
  extractedFields: null,
  completeness: null,
  duplicates: null,
  riskAssessment: null,
  rootCause: null,
  capaRecommendations: null,
  executiveSummary: '',
  copilotMessages: [
    {
      sender: 'assistant',
      text: 'Hello! I am your AIVOA Copilot AI Assistant. I manage the Log Customer Complaint form on the left.\n\nYou can use my 3 AI tools on the right to auto-fill or update the complaint form:\n1. 📝 Log Complaint Tool: Enter a complaint prompt.\n2. ✏️ Edit Complaint Tool: Modify fields using natural language.\n3. 📄 Document Extraction Tool: Upload a PDF/email or pick a realistic pharma sample.'
    }
  ]
};

const copilotSlice = createSlice({
  name: 'copilot',
  initialState,
  reducers: {
    setRawInputText: (state, action) => {
      state.rawInputText = action.payload;
    },
    setEditPromptText: (state, action) => {
      state.editPromptText = action.payload;
    },
    setActiveTool: (state, action) => {
      state.activeTool = action.payload;
    },
    setSampleId: (state, action) => {
      state.sampleId = action.payload;
    },
    addCopilotMessage: (state, action) => {
      state.copilotMessages.push(action.payload);
    },
    resetCopilotState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      /* Log Complaint Tool */
      .addCase(analyzeComplaintAsync.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisError = null;
        state.activeNodeStep = 1;
      })
      .addCase(analyzeComplaintAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.extractedFields = action.payload.extracted_fields;
        state.completeness = action.payload.completeness;
        state.duplicates = action.payload.duplicates;
        state.riskAssessment = action.payload.risk_assessment;
        state.rootCause = action.payload.root_cause;
        state.capaRecommendations = action.payload.capa_recommendations;
        state.executiveSummary = action.payload.executive_summary;
        state.graphTrace = action.payload.graph_trace || [];
        state.activeNodeStep = 7;
        
        state.copilotMessages.push({
          sender: 'assistant',
          text: `✅ **Logged Complaint via AI Tool**\nExtracted Product: ${action.payload.extracted_fields?.product_name || 'N/A'}\nBatch: ${action.payload.extracted_fields?.batch_number || 'N/A'}\nRisk Level: ${action.payload.risk_assessment?.risk_level || 'Medium'}\nForm auto-populated on the left.`
        });
      })
      .addCase(analyzeComplaintAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisError = action.payload;
        state.activeNodeStep = 0;
      })

      /* Edit Complaint Tool */
      .addCase(editComplaintAsync.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisError = null;
      })
      .addCase(editComplaintAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.extractedFields = action.payload.extracted_fields;
        state.riskAssessment = action.payload.risk_assessment;
        state.rootCause = action.payload.root_cause;
        state.capaRecommendations = action.payload.capa_recommendations;
        state.executiveSummary = action.payload.executive_summary;
        
        state.copilotMessages.push({
          sender: 'assistant',
          text: `✏️ **Updated Form via Edit Tool**\n${action.payload.copilot_explanation || 'Updated requested fields while preserving existing complaint data.'}`
        });
        state.editPromptText = '';
      })
      .addCase(editComplaintAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisError = action.payload;
      })

      /* Document Extraction Tool */
      .addCase(uploadDocumentAsync.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisError = null;
      })
      .addCase(uploadDocumentAsync.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.extractedFields = action.payload.extracted_fields;
        state.completeness = action.payload.completeness;
        state.duplicates = action.payload.duplicates;
        state.riskAssessment = action.payload.risk_assessment;
        state.rootCause = action.payload.root_cause;
        state.capaRecommendations = action.payload.capa_recommendations;
        state.executiveSummary = action.payload.executive_summary;
        state.graphTrace = action.payload.graph_trace || [];
        state.activeNodeStep = 7;
        
        state.copilotMessages.push({
          sender: 'assistant',
          text: `📄 **Document Extracted via PDF/Email Tool**\nExtracted details and populated form on the left.`
        });
      })
      .addCase(uploadDocumentAsync.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisError = action.payload;
      });
  }
});

export const { setRawInputText, setEditPromptText, setActiveTool, setSampleId, addCopilotMessage, resetCopilotState } = copilotSlice.actions;
export default copilotSlice.reducer;
