import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add interceptors to set the base URL and auth token
api.interceptors.request.use(async (config) => {
  const serverUrl = await SecureStore.getItemAsync('serverUrl');
  const token = await SecureStore.getItemAsync('token');
  
  if (serverUrl) {
    config.baseURL = serverUrl;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Authentication
export const loginToERPNext = async (
  serverUrl: string,
  email: string,
  password: string
) => {
  try {
    // For development only - mock login response
    if (process.env.NODE_ENV === 'development') {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return {
        user: {
          id: '1',
          name: 'John Doe',
          email: email,
          role: 'System Manager',
        },
        token: 'mock-token-12345',
      };
    }
    
    // Real implementation would call the ERPNext login API
    const response = await axios.post(`${serverUrl}/api/method/login`, {
      usr: email,
      pwd: password,
    });
    
    // Handle auth response
    if (response.data && response.data.message === 'Logged In') {
      // Fetch user info
      const userResponse = await axios.get(`${serverUrl}/api/method/frappe.auth.get_logged_user`, {
        headers: {
          'Cookie': response.headers['set-cookie']?.[0] || '',
        },
      });
      
      return {
        user: {
          id: userResponse.data.message,
          name: userResponse.data.message, // Would need another API call to get full name
          email: email,
          role: 'User', // Would need another API call to get roles
        },
        token: response.headers['set-cookie']?.[0] || '',
      };
    }
    
    throw new Error('Login failed');
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 404) {
      throw new Error('ERPNext server not found. Please check the URL');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Please check your network');
    } else if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your connection');
    }
    throw new Error(error.message || 'Login failed');
  }
};

// Dashboard data
export const fetchDashboardData = async () => {
  try {
    // For development only - mock dashboard data
    if (process.env.NODE_ENV === 'development') {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      return {
        salesTotal: 125750.25,
        newCustomers: 8,
        openOrders: 12,
        pendingTasks: 5,
        alerts: [
          {
            title: 'Low Inventory Alert',
            message: 'Product SKU-123 is below minimum stock level',
            type: 'warning',
          },
          {
            title: 'Payment Overdue',
            message: 'Customer ABC Corp has 3 overdue invoices',
            type: 'error',
          },
        ],
        recentSales: [
          {
            id: 'SINV-001',
            customer: 'Acme Inc.',
            amount: 12500.00,
            description: 'Annual subscription renewal',
          },
          {
            id: 'SINV-002',
            customer: 'Tech Solutions Ltd.',
            amount: 8750.50,
            description: 'Consulting services',
          },
          {
            id: 'SINV-003',
            customer: 'Global Enterprises',
            amount: 22340.75,
            description: 'Hardware purchase',
          },
        ],
      };
    }
    
    // Real implementation would call multiple ERPNext API endpoints
    const response = await api.get('/api/method/erpnext.api.get_dashboard_data');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Search
export const searchERPNextData = async (query: string, docType: string = 'All') => {
  try {
    // For development only - mock search results
    if (process.env.NODE_ENV === 'development') {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // If no query, return empty results
      if (!query.trim()) {
        return [];
      }
      
      // Sample search results
      const allResults = [
        { id: '1', title: 'SINV-00001', subtitle: 'Invoice for Acme Inc.', type: 'Invoice' },
        { id: '2', title: 'Acme Inc.', subtitle: 'Customer', type: 'Customer' },
        { id: '3', title: 'John Smith', subtitle: 'Contact', type: 'Contact' },
        { id: '4', title: 'SO-00123', subtitle: 'Sales Order for XYZ Corp', type: 'Sales Order' },
        { id: '5', title: 'Project Alpha', subtitle: 'In Progress', type: 'Project' },
        { id: '6', title: 'Widget X', subtitle: 'Item', type: 'Item' },
      ];
      
      // Filter by doc type if not "All"
      if (docType !== 'All') {
        return allResults.filter(result => result.type === docType);
      }
      
      // Filter by query
      return allResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) || 
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Real implementation would call the ERPNext search API
    const response = await api.get('/api/method/frappe.desk.search.search_widget', {
      params: {
        txt: query,
        doctype: docType === 'All' ? '' : docType,
      },
    });
    
    // Transform the response to match our format
    if (response.data && response.data.message) {
      return response.data.message.map((item: any) => ({
        id: item.value,
        title: item.label || item.value,
        subtitle: item.description || '',
        type: item.type || docType,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

export default api;