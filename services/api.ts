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
    const employeeResponse = await api.get(
      `/api/resource/Employee?filters=[["user_id","=","${email}"]]&fields=["gender","cell_number","passport_number","date_of_joining"]`
    );

    const employeeData = employeeResponse.data.data[0] || {};

    return {
      user: {
        id: email,
        name:
          profileResponse.data.data.full_name ||
          profileResponse.data.data.first_name ||
          email,
        email: email,
        role: profileResponse.data.data.role_profile_name || 'User',
        gender: employeeData.gender || 'N/A',
        mobile: employeeData.cell_number || 'N/A',
        passport_nid: employeeData.passport_number || 'N/A',
        date_of_joining: employeeData.date_of_joining || 'N/A',
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
          fields: '["grand_total", "posting_date"]',
          filters: JSON.stringify([
            ['posting_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]]
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
          fields: '["name", "status", "grand_total"]',
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
      grand_total: number;
    }
    if (salesResponse.status === 'fulfilled') {
      const salesData = salesResponse.value.data.data || [];
      salesTotal = salesData.reduce((sum: number, invoice: Invoice) => sum + (invoice.grand_total || 0), 0);
      recentSales = salesData.slice(0, 3).map((invoice: Invoice) => ({
        id: invoice.name,
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
      grand_total: number;
    }
    if (ordersResponse.status === 'fulfilled') {
      const ordersData = ordersResponse.value.data.data || [];
      openOrders = ordersData.length || 0;
      recentSalesOrders = ordersData.map((order: SalesOrder) => ({
        id: order.name,
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

// Get monthly sales data for the last 6 months
export const getMonthlySales = async () => {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const response = await api.get('/api/resource/Sales Order', {
      params: {
        fields: '["transaction_date", "grand_total"]',
        filters: JSON.stringify([
          ['transaction_date', '>=', sixMonthsAgo.toISOString().split('T')[0]],
          ['docstatus', '=', 1],
        ]),
        limit_page_length: 1000, // Adjust as needed
      },
    });

    const salesData = response.data.data || [];
    const monthlySales: { [key: string]: number } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlySales[monthKey] = 0;
    }
    
    salesData.forEach((order: { transaction_date: string; grand_total: number }) => {
      const date = new Date(order.transaction_date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlySales.hasOwnProperty(monthKey)) {
        monthlySales[monthKey] += order.grand_total;
      }
    });

    return Object.keys(monthlySales).map(key => ({
      month: key.split(' ')[0],
      value: monthlySales[key],
    }));

  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }
};

// Get check-in/out data for a specific user
export const getCheckIns = async (employeeId: string) => {
  try {
    const response = await api.get('/api/resource/Employee Checkin', {
      params: {
        filters: JSON.stringify([['employee', '=', employeeId]]),
        fields: '["name", "log_type", "creation"]',
        order_by: 'creation desc',
        limit_page_length: 50,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    throw error;
  }
};

// Create a new check-in/out record
export const createCheckIn = async (data: { employee: string; log_type: 'IN' | 'OUT' }) => {
  try {
    const response = await api.post('/api/resource/Employee Checkin', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating check-in:', error);
    throw error;
  }
};

export const postLocationData = async (locationData: {
  user: string; // Changed from userId to user
  latitude: number;
  longitude: number;
  timestamp: string;
  // Removed deviceId and locationSource as per user's new spec
}) => {
  try {
    console.log('Posting location data:', JSON.stringify(locationData, null, 2));
    // Changed endpoint to /api/resource/Mobile Location and removed data wrapper
    const response = await api.post('/api/resource/Mobile Location', locationData);
    console.log('Location data posted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting location data:', error);
    throw error;
  }
};

export const fetchDocTypeData = async (doctype: string, fields: string[] = ['name'], filters: any[] = [], orderBy: string = 'name asc') => {
  try {
    const response = await api.get(`/api/resource/${doctype}`, {
      params: {
        fields: JSON.stringify(fields),
        filters: JSON.stringify(filters),
        order_by: orderBy,
        limit_page_length: 1000, // Adjust as needed
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error(`Error fetching ${doctype} data:`, error);
    throw error;
  }
};

export const createDoc = async (doctype: string, doc: any) => {
  try {
    const response = await api.post(`/api/resource/${doctype}`, doc);
    return response.data.data;
  } catch (error) {
    console.error(`Error creating ${doctype}:`, error);
    throw error;
  }
};

export default api;
