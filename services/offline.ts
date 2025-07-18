import { getCache, setCache } from './cache';
import * as erpnext from './erpnext';
import { getQueue, addToQueue, clearQueue } from './queue';
import api from './api';

export const syncQueue = async () => {
  const queue = await getQueue();
  if (queue.length === 0) {
    return;
  }

  for (const request of queue) {
    try {
      await api.post(request.url, request.data);
    } catch (error) {
      console.error('Failed to sync request:', error);
      // If a request fails, we should probably keep it in the queue
      // and try again later. For now, we'll just log the error.
    }
  }

  await clearQueue();
};

export const getCustomers = async (isConnected: boolean, filters = [], fields = '["name", "customer_name", "customer_group", "territory", "customer_type"]') => {
  const cacheKey = `customers_${JSON.stringify(filters)}_${fields}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!isConnected) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await erpnext.getCustomers(filters, fields);
  await setCache(cacheKey, data);
  return data;
};

export const getItems = async (isConnected: boolean, filters = [], fields = '["name", "item_name", "item_group", "stock_uom"]') => {
  const cacheKey = `items_${JSON.stringify(filters)}_${fields}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!isConnected) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await erpnext.getItems(filters, fields);
  await setCache(cacheKey, data);
  return data;
};

export const getQuotations = async (isConnected: boolean, filters = [], fields = '["name", "customer_name", "transaction_date", "status", "grand_total", "valid_till"]') => {
  const cacheKey = `quotations_${JSON.stringify(filters)}_${fields}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!isConnected) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await erpnext.getQuotations(filters, fields);
  await setCache(cacheKey, data);
  return data;
};

export const getSalesOrders = async (isConnected: boolean, filters = [], fields = '["name", "transaction_date", "status", "grand_total"]') => {
  const cacheKey = `sales_orders_${JSON.stringify(filters)}_${fields}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!isConnected) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await erpnext.getSalesOrders(filters, fields);
  await setCache(cacheKey, data);
  return data;
};

export const getTasks = async (isConnected: boolean, filters = [], fields = '["name", "subject", "status", "exp_start_date", "exp_end_date"]') => {
  const cacheKey = `tasks_${JSON.stringify(filters)}_${fields}`.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (!isConnected) {
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await erpnext.getTasks(filters, fields);
  await setCache(cacheKey, data);
  return data;
};

export const createCustomer = async (isConnected: boolean, customerData: any) => {
  if (!isConnected) {
    await addToQueue({
      url: '/api/resource/Customer',
      data: customerData,
    });
    return { ...customerData, offline: true };
  }

  return await erpnext.createCustomer(customerData);
};

export const createItem = async (isConnected: boolean, itemData: any) => {
  if (!isConnected) {
    await addToQueue({
      url: '/api/resource/Item',
      data: itemData,
    });
    return { ...itemData, offline: true };
  }

  return await erpnext.createItem(itemData);
};

export const createQuotation = async (isConnected: boolean, quotationData: any) => {
  if (!isConnected) {
    await addToQueue({
      url: '/api/resource/Quotation',
      data: quotationData,
    });
    return { ...quotationData, offline: true };
  }

  return await erpnext.createQuotation(quotationData);
};

export const createSalesOrder = async (isConnected: boolean, salesOrderData: any) => {
  if (!isConnected) {
    await addToQueue({
      url: '/api/resource/Sales Order',
      data: salesOrderData,
    });
    return { ...salesOrderData, offline: true };
  }

  return await erpnext.createSalesOrder(salesOrderData);
};

export const createTask = async (isConnected: boolean, taskData: any) => {
  if (!isConnected) {
    await addToQueue({
      url: '/api/resource/Task',
      data: taskData,
    });
    return { ...taskData, offline: true };
  }

  return await erpnext.createTask(taskData);
};
