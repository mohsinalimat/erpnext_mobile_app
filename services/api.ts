import axios from 'axios';
import { API_KEY, API_SECRET, ERPNEXT_SERVER_URL } from './config';

// Create axios instance
const api = axios.create({
  baseURL: ERPNEXT_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `token ${API_KEY}:${API_SECRET}`,
  },
  timeout: 30000,
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
    // With API key authentication, we can directly fetch user information
    // First verify the API key works by making a test call
    const testResponse = await api.get('/api/method/frappe.auth.get_logged_user');
    
    // Get user profile information
    const profileResponse = await api.get(`/api/resource/User/${email}`);
    
    return {
      user: {
        id: email,
        name: profileResponse.data.data.full_name || profileResponse.data.data.first_name || email,
        email: email,
        role: profileResponse.data.data.role_profile_name || 'User',
      },
      token: `${API_KEY}:${API_SECRET}`,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.status === 401) {
      throw new Error('Invalid API credentials or user not found');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your permissions');
    } else if (error.response?.status === 404) {
      throw new Error('User not found or ERPNext server not accessible');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timeout. Please check your network');
    } else if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your connection');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to ERPNext server. Please check the URL and your network');
    }
    throw new Error(error.message || 'Authentication failed');
  }
};

// Dashboard data
export const fetchDashboardData = async (userId: string) => {
  try {
    // Fetch dashboard data from multiple ERPNext endpoints
    const [salesResponse, customersResponse, ordersResponse] = await Promise.allSettled([
      // Get sales data
      api.get('/api/resource/Sales Invoice', {
        params: {
          fields: '["grand_total", "posting_date", "customer"]',
          filters: JSON.stringify([
            ['posting_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]],
            ['customer', '=', userId]
          ]),
          limit_page_length: 100,
        },
      }),
      // Get customer count
      api.get('/api/method/frappe.client.get_count', {
        params: {
          doctype: 'Customer',
          filters: JSON.stringify({
            creation: ['>=', new Date().toISOString().split('T')[0]],
          }),
        },
      }),
      // Get sales orders
      api.get('/api/resource/Sales Order', {
        params: {
          fields: '["name", "status", "grand_total", "customer"]',
          filters: JSON.stringify({
            transaction_date: ['>=', new Date().toISOString().split('T')[0]],
          }),
          limit_page_length: 100,
        },
      }),
    ]);

    // Process sales data
    let salesTotal = 0;
    let recentSales = [];
    interface Invoice {
      name: string;
      customer: string;
      grand_total: number;
    }
    if (salesResponse.status === 'fulfilled') {
      const salesData = salesResponse.value.data.data || [];
      salesTotal = salesData.reduce((sum: number, invoice: Invoice) => sum + (invoice.grand_total || 0), 0);
      recentSales = salesData.slice(0, 3).map((invoice: Invoice) => ({
        id: invoice.name,
        customer: invoice.customer,
        amount: invoice.grand_total || 0,
        description: `Invoice ${invoice.name}`,
      }));
    }

    // Process customer data
    let newCustomers = 0;
    if (customersResponse.status === 'fulfilled') {
      newCustomers = customersResponse.value.data.message || 0;
    }

    // Process orders data
    let openOrders = 0;
    let recentSalesOrders = [];
    interface SalesOrder {
      name: string;
      customer: string;
      grand_total: number;
    }
    if (ordersResponse.status === 'fulfilled') {
      const ordersData = ordersResponse.value.data.data || [];
      openOrders = ordersData.length || 0;
      recentSalesOrders = ordersData.map((order: SalesOrder) => ({
        id: order.name,
        customer: order.customer,
        amount: order.grand_total || 0,
        description: `Sales Order ${order.name}`,
      }));
    }

    return {
      salesTotal,
      newCustomers,
      openOrders,
      pendingTasks: 0, // Would need to fetch from ToDo or Task doctype
      alerts: [], // Would need custom logic based on your business rules
      recentSales: recentSalesOrders,
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
        type: "warning" as "warning" | "info" | "error",
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
