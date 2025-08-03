import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const bookParcel = createAsyncThunk(
  'parcels/book',
  async (parcelData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/parcels/book`, parcelData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getBookingHistory = createAsyncThunk(
  'parcels/history',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/parcels/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllParcels = createAsyncThunk(
  'parcels/all',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/parcels/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAssignedParcels = createAsyncThunk(
  'parcels/assigned',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/parcels/assigned`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateParcelStatus = createAsyncThunk(
  'parcels/updateStatus',
  async ({ parcelId, status, location }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/parcels/${parcelId}/status`, 
        { status, location }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignAgentToParcel = createAsyncThunk(
  'parcels/assignAgent',
  async ({ parcelId, agentId }, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/parcels/${parcelId}/assign`, 
        { agentId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  'parcels/dashboardStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/parcels/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  parcels: [],
  bookingHistory: [],
  assignedParcels: [],
  loading: false,
  error: null,
};

const parcelSlice = createSlice({
  name: 'parcels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateParcelInList: (state, action) => {
      const index = state.parcels.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.parcels[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Parcel
      .addCase(bookParcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookParcel.fulfilled, (state, action) => {
        state.loading = false;
        state.parcels.unshift(action.payload.parcel);
      })
      .addCase(bookParcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to book parcel';
      })
      // Get Booking History
      .addCase(getBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingHistory = action.payload;
      })
      .addCase(getBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch booking history';
      })
      // Get All Parcels
      .addCase(getAllParcels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllParcels.fulfilled, (state, action) => {
        state.loading = false;
        state.parcels = action.payload;
      })
      .addCase(getAllParcels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch parcels';
      })
      // Get Assigned Parcels
      .addCase(getAssignedParcels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssignedParcels.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedParcels = action.payload;
      })
      .addCase(getAssignedParcels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch assigned parcels';
      })
      // Update Parcel Status
      .addCase(updateParcelStatus.fulfilled, (state, action) => {
        const updatedParcel = action.payload.parcel;
    
        const parcelIndex = state.parcels.findIndex(p => p._id === updatedParcel._id);
        if (parcelIndex !== -1) {
          state.parcels[parcelIndex] = updatedParcel;
        }
        
        const assignedIndex = state.assignedParcels.findIndex(p => p._id === updatedParcel._id);
        if (assignedIndex !== -1) {
          state.assignedParcels[assignedIndex] = updatedParcel;
        }
      
        const historyIndex = state.bookingHistory.findIndex(p => p._id === updatedParcel._id);
        if (historyIndex !== -1) {
          state.bookingHistory[historyIndex] = updatedParcel;
        }
      })
      // Assign Agent
      .addCase(assignAgentToParcel.fulfilled, (state, action) => {
        const updatedParcel = action.payload.parcel;
        const parcelIndex = state.parcels.findIndex(p => p._id === updatedParcel._id);
        if (parcelIndex !== -1) {
          state.parcels[parcelIndex] = updatedParcel;
        }
      });
  },
});

export const { clearError, updateParcelInList } = parcelSlice.actions;
export default parcelSlice.reducer; 