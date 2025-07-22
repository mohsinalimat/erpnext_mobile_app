import { getCache, setCache } from './cache';
import * as erpnext from './erpnext';
import { getQueue, addToQueue, clearQueue } from './queue';
import api, { postLocationData } from './api';

export const syncQueue = async () => {
  const queue = await getQueue();
  if (queue.length === 0) {
    return;
  }

  const failedRequests = [];

  for (const request of queue) {
    try {
      switch (request.type) {
        case 'location':
          await postLocationData(request.payload);
          break;
        case 'createCustomer':
          await erpnext.createCustomer(request.payload);
          break;
        case 'createItem':
          await erpnext.createItem(request.payload);
          break;
        case 'createQuotation':
          await erpnext.createQuotation(request.payload);
          break;
        case 'createSalesOrder':
          await erpnext.createSalesOrder(request.payload);
          break;
        case 'createTask':
          await erpnext.createTask(request.payload);
          break;
        // Add other cases for different request types here
        default:
          await api.post(request.url, { data: request.data });
      }
    } catch (error) {
      console.error('Failed to sync request:', error);
      failedRequests.push(request);
    }
  }

  await clearQueue();
  for (const request of failedRequests) {
    await addToQueue(request);
  }
};

setInterval(syncQueue, 300000); // Sync every 5 minutes

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
      type: 'createCustomer',
      payload: customerData,
    });
    return { ...customerData, offline: true };
  }

  return await erpnext.createCustomer(customerData);
};

export const createItem = async (isConnected: boolean, itemData: any) => {
  if (!isConnected) {
    await addToQueue({
      type: 'createItem',
      payload: itemData,
    });
    return { ...itemData, offline: true };
  }

  return await erpnext.createItem(itemData);
};

export const createQuotation = async (isConnected: boolean, quotationData: any) => {
  if (!isConnected) {
    await addToQueue({
      type: 'createQuotation',
      payload: quotationData,
    });
    return { ...quotationData, offline: true };
  }

  return await erpnext.createQuotation(quotationData);
};

export const createSalesOrder = async (isConnected: boolean, salesOrderData: any) => {
  if (!isConnected) {
    await addToQueue({
      type: 'createSalesOrder',
      payload: salesOrderData,
    });
    return { ...salesOrderData, offline: true };
  }

  return await erpnext.createSalesOrder(salesOrderData);
};

export const createTask = async (isConnected: boolean, taskData: any) => {
  if (!isConnected) {
    await addToQueue({
      type: 'createTask',
      payload: taskData,
    });
    return { ...taskData, offline: true };
  }

  return await erpnext.createTask(taskData);
};
