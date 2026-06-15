export const api = {
  getProducts: async () => (await fetch('/api/products')).json(),
  createProduct: async (data: any) => fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getSuppliers: async () => (await fetch('/api/suppliers')).json(),
  createSupplier: async (data: any) => fetch('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getSupplierOrders: async () => (await fetch('/api/supplier-orders')).json(),
  createSupplierOrder: async (data: any) => fetch('/api/supplier-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  validateSupplierOrder: async (id: string, data: any) => fetch(`/api/supplier-orders/${id}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getSupplierReceipts: async () => (await fetch('/api/supplier-receipts')).json(),
  createSupplierReceipt: async (data: any) => fetch('/api/supplier-receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  validateSupplierReceipt: async (id: string, data: any) => fetch(`/api/supplier-receipts/${id}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getProjects: async () => (await fetch('/api/projects')).json(),
  createProject: async (data: any) => fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getServices: async () => (await fetch('/api/services')).json(),
  getProjectNeeds: async () => (await fetch('/api/project-needs')).json(),
  createProjectNeed: async (data: any) => {
    const response = await fetch('/api/project-needs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Impossible de créer le besoin');
    return response.json();
  },
  getReservations: async () => (await fetch('/api/reservations')).json(),
  createReservation: async (data: any) => fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getOutbounds: async () => (await fetch('/api/outbounds')).json(),
  createOutbound: async (data: any) => fetch('/api/outbounds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  validateOutbound: async (id: string) => fetch(`/api/outbounds/${id}/validate`, { method: 'POST' }),
  cancelOutbound: async (id: string) => fetch(`/api/outbounds/${id}/cancel`, { method: 'POST' }),
  createOutboundReturn: async (id: string, data: any) => fetch(`/api/outbounds/${id}/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getInstallations: async () => (await fetch('/api/installations')).json(),
  createInstallation: async (data: any) => fetch('/api/installations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getInterventions: async () => (await fetch('/api/interventions')).json(),
  createIntervention: async (data: any) => fetch('/api/interventions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getMovements: async () => (await fetch('/api/movements')).json(),
  createMovement: async (data: any) => fetch('/api/movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  getClients: async () => (await fetch('/api/clients')).json(),
  createClient: async (data: any) => fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
};
