import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const travelApi = {
  // Metadata & Lookups
  getMeta: () => client.get('/travel/meta'),
  getDashboardStats: (params) => client.get('/dashboard/stats', { params }),
  getHistoricalTrends: (params) => client.get('/dashboard/historical-trends', { params }),
  getAirlineComparison: () => client.get('/dashboard/airline-comparison'),
  getMonthlySeasonalTrends: () => client.get('/dashboard/monthly-seasonal-trends'),
  getCategoryComparison: () => client.get('/dashboard/category-comparison'),
  getDestinationMapData: () => client.get('/dashboard/destination-map-data'),

  // Travel Searches
  searchFlights: (params) => client.get('/travel/flights', { params }),
  searchHotels: (params) => client.get('/travel/hotels', { params }),
  searchTrains: (params) => client.get('/travel/trains', { params }),
  searchBuses: (params) => client.get('/travel/buses', { params }),
  compareModes: (source, destination) => client.get('/travel/compare', { params: { source, destination } }),

  // ML Price Prediction
  predictPrice: (payload) => client.post('/predict/', payload),
  getModelMetrics: () => client.get('/predict/metrics'),

  // SQL Explorer
  getPredefinedQueries: () => client.get('/sql/predefined'),
  executeSql: (query) => client.post('/sql/execute', { query }),

  // Datasets
  getDatasetSummary: () => client.get('/datasets/summary'),
  getRawPreview: (limit = 50) => client.get('/datasets/preview/raw', { params: { limit } }),
  getCleanedPreview: (limit = 50) => client.get('/datasets/preview/cleaned', { params: { limit } }),
  uploadDataset: (formData) => client.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // AI Assistant
  chatWithAi: (message, history = []) => client.post('/assistant/chat', { message, conversation_history: history }),
  getSuggestedQuestions: () => client.get('/assistant/suggested-questions'),

  // Reports & Power BI
  getReportSummary: () => client.get('/reports/summary'),
  getPowerBiExportUrl: (dataset) => `${API_BASE}/reports/export/powerbi-csv?dataset=${dataset}`,

  // Auth & Health
  checkHealth: () => client.get('/health'),
  getCurrentUser: () => client.get('/auth/me'),
  login: (credentials) => client.post('/auth/login', credentials),
  register: (userData) => client.post('/auth/register', userData),
};

export default travelApi;
