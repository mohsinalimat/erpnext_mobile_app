// Fetch today's sales orders
export const getTodaysSalesOrders = async () => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    const response = await api.get(
      `/api/resource/Sales Order?fields=["name","customer","transaction_date","status","grand_total"]&filters=[["transaction_date","=","${today}"]]`
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to fetch today\'s sales orders:', error.response?.data || error.message);
    throw error;
  }
};
import api from './api';

export const getCustomers = async () => {
  try {
    const response = await api.get(
      `/api/resource/Customer?fields=["name", "customer_name", "customer_group"]`
    );
    return response.data.data;
  } catch (error: any) {
    console.error(
      'Failed to fetch customers:',
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getItems = async () => {
  try {
    const response = await api.get(
      `/api/resource/Item?fields=["name", "item_name", "item_group"]`
    );
    return response.data.data;
  } catch (error: any) {
    console.error(
      'Failed to fetch items:',
      error.response?.data || error.message
    );
    throw error;
  }
};
