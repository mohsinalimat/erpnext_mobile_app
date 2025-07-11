import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Your ERPNext server URL
const ERPNEXT_SERVER_URL = 'https://paperware.jfmart.site';

// Create axios instance
const api = axios.create({
  baseURL: ERPNEXT_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Helper functions for storage (same as in AuthContext)
const getStoredItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting stored item: ${key}`, error);
    return null;
  }
};

// Add interceptors to set the base URL and auth token
api.interceptors.request.use(async (config) => {
  const token = await getStoredItem('token');
  const sessionId = await getStoredItem('sessionId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (sessionId) {
    config.headers.Cookie = sessionId;
  }
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Authentication
export const loginToERPNext = async (
  serverUrl: string,
  email: string,
  password: string
) => {
  try {
    // Call ERPNext login API
    const response = await axios.post(`${ERPNEXT_SERVER_URL}/api/method/login`, {
      usr: email,
      pwd: password,
    }, {
      withCredentials: true,
    });
    
    if (response.data && response.data.message === 'Logged In') {
      // Get session cookie
      const sessionCookie = response.headers['set-cookie']?.[0] || '';
      
      // Fetch user details
      const userResponse = await axios.get(`${ERPNEXT_SERVER_URL}/api/method/frappe.auth.get_logged_user`, {
        headers: { Cookie: sessionCookie },
        withCredentials: true,
      });
      
      // Get user profile information
      const profileResponse = await axios.get(`${ERPNEXT_SERVER_URL}/api/resource/User/${email}`, {
        headers: { Cookie: sessionCookie },
        withCredentials: true,
      });
      
      return {
        user: {
          id: email,
          name: profileResponse.data.data.full_name || profileResponse.data.data.first_name || email,
          email: email,
          role: profileResponse.data.data.role_profile_name || 'User',
        },
        sessionId: sessionCookie,
      };
    }
    
    throw new Error('Login failed');
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your permissions');
    } else if (error.response?.status === 404) {
      throw new Error('ERPNext server not found. Please check the URL');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Please check your network');
    } else if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your connection');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to ERPNext server. Please check the URL and your network');
    }
    throw new Error(error.message || 'Login failed');
  }
};

// Dashboard data
export const fetchDashboardData = async () => {
  try {
    // Fetch dashboard data from multiple ERPNext endpoints
    const [salesResponse, customersResponse, ordersResponse] = await Promise.allSettled([
      // Get sales data
      api.get('/api/resource/Sales Invoice', {
        params: {
          fields: '["grand_total", "posting_date", "customer"]',
          filters: JSON.stringify([['posting_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]]]),
          limit_page_length: 100,
        },
      }),
      // Get customer count
      api.get('/api/resource/Customer', {
        params: {
          fields: '["name", "creation"]',
          filters: JSON.stringify([['creation', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]]]),
          limit_page_length: 1000,
        },
      }),
      // Get sales orders
      api.get('/api/resource/Sales Order', {
        params: {
          fields: '["name", "status", "grand_total", "customer"]',
          filters: JSON.stringify([['status', '!=', 'Completed']]),
          limit_page_length: 100,
        },
      }),
    ]);

    // Process sales data
    let salesTotal = 0;
    let recentSales = [];
    if (salesResponse.status === 'fulfilled') {
      const salesData = salesResponse.value.data.data || [];
      salesTotal = salesData.reduce((sum, invoice) => sum + (invoice.grand_total || 0), 0);
      recentSales = salesData.slice(0, 3).map(invoice => ({
        id: invoice.name,
        customer: invoice.customer,
        amount: invoice.grand_total || 0,
        description: `Invoice ${invoice.name}`,
      }));
    }

    // Process customer data
    let newCustomers = 0;
    if (customersResponse.status === 'fulfilled') {
      newCustomers = customersResponse.value.data.data?.length || 0;
    }

    // Process orders data
    let openOrders = 0;
    if (ordersResponse.status === 'fulfilled') {
      openOrders = ordersResponse.value.data.data?.length || 0;
    }

    return {
      salesTotal,
      newCustomers,
      openOrders,
      pendingTasks: 0, // Would need to fetch from ToDo or Task doctype
      alerts: [], // Would need custom logic based on your business rules
      recentSales,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return fallback data if API calls fail
    return {
      salesTotal: 0,
      newCustomers: 0,
      openOrders: 0,
      pendingTasks: 0,
      alerts: [{
        title: 'Connection Error',
        message: 'Unable to fetch latest data from ERPNext',
        type: 'warning',
      }],
      recentSales: [],
    };
  }
};

// Search
export const searchERPNextData = async (query: string, docType: string = 'All') => {
  try {
    if (!query.trim()) {
      return [];
    }
    
    // Use ERPNext's global search API
    const response = await api.get('/api/method/frappe.desk.search.search_link', {
      params: {
        txt: query,
        doctype: docType === 'All' ? undefined : docType,
        ignore_user_permissions: 0,
      },
    });
    
    if (response.data?.message) {
      return response.data.message.map((item: any, index: number) => ({
        id: item.value,
        title: item.value,
        subtitle: item.description || '',
        type: docType === 'All' ? 'Document' : docType,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error performing search:', error);
    return [];
  }
};

// Get ERPNext server info
export const getServerInfo = async () => {
  try {
    const response = await api.get('/api/method/frappe.utils.change_log.get_versions');
    return response.data;
  } catch (error) {
    console.error('Error fetching server info:', error);
    return null;
  }
};

export default api;