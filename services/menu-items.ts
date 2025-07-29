export const menuItems = [
  {
    items: [{ name: 'Dashboard', route: 'dashboard' }],
  },
  {
    title: 'HR',
    items: [
      { name: 'HR Dashboard', route: 'hr' },
      { name: 'Leaves', route: 'leaves' },
      { name: 'Expenses', route: 'expenses' },
      { name: 'Salary Slips', route: 'salary' },
      { name: 'Attendance', route: 'attendance' },
    ],
  },
  {
    title: 'Selling',
    items: [
      { name: 'Customers List', route: 'customers' },
      { name: 'New Customer', route: 'new-customer' },           
      { name: 'Quotations List', route: 'quotation' },
      { name: 'New Quotation', route: 'new-quotation' },
      { name: 'Sales Orders List', route: 'sales-order' },
      { name: 'New Sales Order', route: 'new-sales-order' },
    ],
  },
  {
    title: 'CRM',
    items: [
      { name: 'Contacts List', route: 'contact' }, 
      { name: 'New Contact', route: 'new-contact' },
      { name: 'Address List', route: 'address' },
      { name: 'New Address', route: 'new-address' },
      { name: 'Leads', route: 'leads' },
      { name: 'New Lead', route: 'new-lead' },
      { name: 'Opportunities', route: 'opportunities' },
      { name: 'New Opportunity', route: 'new-opportunity' },
      { name: 'Tasks', route: 'tasks' },
      { name: 'New Task', route: 'new-task' },
    ],
  },
  {
    title: 'Stock',
    items: [
      { name: 'Items List', route: 'items' },
      { name: 'New Item', route: 'new-item' },
    ],
  },
];
