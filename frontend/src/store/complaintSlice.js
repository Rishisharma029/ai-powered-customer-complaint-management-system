import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const fetchComplaintsAsync = createAsyncThunk(
  'complaints/fetchComplaints',
  async ({ search = '', status = 'All', risk_level = 'All' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/complaints`, {
        params: { search, status, risk_level }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch complaints');
    }
  }
);

export const saveComplaintAsync = createAsyncThunk(
  'complaints/saveComplaint',
  async (complaintPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/complaints`, complaintPayload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to save complaint');
    }
  }
);

export const fetchKPIsAsync = createAsyncThunk(
  'complaints/fetchKPIs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/complaints/analytics/kpis`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch KPIs');
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    activeComplaint: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    statusFilter: 'All',
    riskFilter: 'All',
    kpis: null,
    saveSuccess: false
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setRiskFilter: (state, action) => {
      state.riskFilter = action.payload;
    },
    setActiveComplaint: (state, action) => {
      state.activeComplaint = action.payload;
    },
    resetSaveSuccess: (state) => {
      state.saveSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintsAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchComplaintsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaintsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(saveComplaintAsync.pending, (state) => {
        state.isLoading = true;
        state.saveSuccess = false;
      })
      .addCase(saveComplaintAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.saveSuccess = true;
        state.items.unshift(action.payload);
      })
      .addCase(saveComplaintAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchKPIsAsync.fulfilled, (state, action) => {
        state.kpis = action.payload;
      });
  }
});

export const { setSearchQuery, setStatusFilter, setRiskFilter, setActiveComplaint, resetSaveSuccess } = complaintSlice.actions;
export default complaintSlice.reducer;
