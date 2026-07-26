import { configureStore } from '@reduxjs/toolkit';
import copilotReducer from './copilotSlice';
import formReducer from './formSlice';
import complaintReducer from './complaintSlice';

export const store = configureStore({
  reducer: {
    copilot: copilotReducer,
    form: formReducer,
    complaints: complaintReducer
  }
});
