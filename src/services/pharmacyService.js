import api from './api';

const pharmacyService = {
    getProfile: async () => {
        const response = await api.get('/pharmacy/me/profile');
        return response.data.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/pharmacy/me/profile', profileData);
        return response.data.data;
    },

    toggleStatus: async () => {
        const response = await api.patch('/pharmacy/me/status');
        return response.data.data;
    },

    // Prescriptions
    getPrescriptions: async (status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (status) params.status = status;
        const response = await api.get('/pharmacy/me/prescriptions', { params });
        return response.data.data; // PagedResponse
    },

    getPrescription: async (prescriptionId) => {
        const response = await api.get(`/pharmacy/me/prescriptions/${prescriptionId}`);
        return response.data.data;
    },

    verifyPrescription: async (prescriptionId) => {
        const response = await api.patch(`/pharmacy/me/prescriptions/${prescriptionId}/verify`);
        return response.data.data;
    },

    dispensePrescription: async (prescriptionId) => {
        const response = await api.patch(`/pharmacy/me/prescriptions/${prescriptionId}/dispense`);
        return response.data.data;
    },

    rejectPrescription: async (prescriptionId, reason) => {
        const response = await api.patch(`/pharmacy/me/prescriptions/${prescriptionId}/reject`, { reason });
        return response.data.data;
    },

    // Orders
    getOrders: async (status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (status) params.status = status;
        const response = await api.get('/pharmacy/me/orders', { params });
        return response.data.data; // PagedResponse
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await api.patch(`/pharmacy/me/orders/${orderId}/status`, { status });
        return response.data.data;
    },

    // Inventory
    getInventory: async (search = null, page = 0, size = 20) => {
        const params = { page, size };
        if (search) params.search = search;
        const response = await api.get('/pharmacy/me/inventory', { params });
        return response.data.data; // PagedResponse
    },

    addInventoryItem: async (itemData) => {
        const response = await api.post('/pharmacy/me/inventory', itemData);
        return response.data.data;
    },

    updateStock: async (itemId, quantity) => {
        const response = await api.patch(`/pharmacy/me/inventory/${itemId}`, null, { params: { quantity } });
        return response.data.data;
    },
};

export default pharmacyService;
