import api from './api';

// =================================================================
// Customer
// =================================================================

export const getCustomers = async (filters = [], fields = '["name", "customer_name", "customer_group", "territory", "customer_type"]') => {
  try {
    const response = await api.get('/api/resource/Customer', {
      params: {
        fields: fields,
        filters: JSON.stringify(filters),
        limit_page_length: 20,
        order_by: 'creation desc',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch customers:', error.response?.data || error.message);
    throw error;
  }
};

export const createCustomer = async (customerData: any) => {
  try {
    const response = await api.post('/api/resource/Customer', customerData);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create customer:', error.response?.data || error.message);
    throw error;
  }
};


// =================================================================
// Item
// =================================================================

export const getItems = async (filters = [], fields = '["name", "item_name", "item_group", "stock_uom"]') => {
  try {
    const response = await api.get('/api/resource/Item', {
      params: {
        fields: fields,
        filters: JSON.stringify(filters),
        limit_page_length: 20,
        order_by: 'creation desc',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch items:', error.response?.data || error.message);
    throw error;
  }
};

export const createItem = async (itemData: any) => {
  try {
    const response = await api.post('/api/resource/Item', itemData);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create item:', error.response?.data || error.message);
    throw error;
  }
};


// =================================================================
// Quotation
// =================================================================

export const getQuotations = async (filters = [], fields = '["name", "transaction_date", "status", "grand_total"]') => {
  try {
    const response = await api.get('/api/resource/Quotation', {
      params: {
        fields: fields,
        filters: JSON.stringify(filters),
        limit_page_length: 20,
        order_by: 'creation desc',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch quotations:', error.response?.data || error.message);
    throw error;
  }
};

export const createQuotation = async (quotationData: any) => {
  try {
    const response = await api.post('/api/resource/Quotation', quotationData);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create quotation:', error.response?.data || error.message);
    throw error;
  }
};


// =================================================================
// Sales Order
// =================================================================

export const getSalesOrders = async (filters = [], fields = '["name", "transaction_date", "status", "grand_total"]') => {
  try {
    const response = await api.get('/api/resource/Sales Order', {
      params: {
        fields: fields,
        filters: JSON.stringify(filters),
        limit_page_length: 20,
        order_by: 'creation desc',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch sales orders:', error.response?.data || error.message);
    throw error;
  }
};

export const createSalesOrder = async (salesOrderData: any) => {
  try {
    const response = await api.post('/api/resource/Sales Order', salesOrderData);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create sales order:', error.response?.data || error.message);
    throw error;
  }
};


// =================================================================
// Task
// =================================================================

export const getTasks = async (filters = [], fields = '["name", "subject", "status", "exp_start_date", "exp_end_date"]') => {
  try {
    const response = await api.get('/api/resource/Task', {
      params: {
        fields: fields,
        filters: JSON.stringify(filters),
        limit_page_length: 20,
        order_by: 'creation desc',
      },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch tasks:', error.response?.data || error.message);
    throw error;
  }
};

export const createTask = async (taskData: any) => {
  try {
    const response = await api.post('/api/resource/Task', taskData);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to create task:', error.response?.data || error.message);
    throw error;
  }
};
