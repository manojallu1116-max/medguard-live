import axios from 'axios';

// The base URL of your Node.js backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// POS Endpoints
export const syncPosBill = (billData) => API.post('/sync/print-bill', billData);

// Patient App Endpoints
export const getPatientSchedule = (userId) => API.get(`/schedule/${userId}`);
export const acknowledgeDose = (scheduleId, timeSlot) => API.post('/schedule/acknowledge', { scheduleId, timeSlot });

// Observer Endpoints
export const getObserverNetwork = (observerId) => API.get(`/alerts/observer/${observerId}`);

// Emergency Endpoints
export const searchBloodDonors = (searchParams) => API.post('/blood/search', searchParams);

export default API;