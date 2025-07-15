import api from './api';

export const runReport = async (reportName: string, filters: any) => {
  try {
    const response = await api.get('/method/frappe.desk.query_report.run', {
      params: {
        report_name: reportName,
        filters: JSON.stringify(filters)
      }
    });
    return response.data.message;
  } catch (error) {
    console.error(`Error running report ${reportName}:`, error);
    throw error;
  }
};
