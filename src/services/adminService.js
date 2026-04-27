import api from './api';

const adminService = {
    getDashboard: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data.data;
    },

    // Patients
    getPatients: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/admin/patients', { params });
        return response.data.data; // PagedResponse
    },

    updatePatientStatus: async (id, status) => {
        const response = await api.patch(`/admin/patients/${id}/status`, { status });
        return response.data.data;
    },

    // Doctors
    getDoctors: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/admin/doctors', { params });
        return response.data.data; // PagedResponse
    },

    updateDoctorStatus: async (id, status) => {
        const response = await api.patch(`/admin/doctors/${id}/status`, { status });
        return response.data.data;
    },

    // Pharmacies
    getPharmacies: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/admin/pharmacies', { params });
        return response.data.data; // PagedResponse
    },

    updatePharmacyStatus: async (id, status) => {
        const response = await api.patch(`/admin/pharmacies/${id}/status`, { status });
        return response.data.data;
    },

    // Appointments
    getAppointments: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/admin/appointments', { params });
        return response.data.data; // PagedResponse
    },

    cancelAppointment: async (appointmentId) => {
        const response = await api.patch(`/admin/appointments/${appointmentId}/cancel`);
        return response.data.data;
    },

    // Prescriptions
    getPrescriptions: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/admin/prescriptions', { params });
        return response.data.data; // PagedResponse
    },

    togglePrescriptionFlag: async (prescriptionId) => {
        const response = await api.patch(`/admin/prescriptions/${prescriptionId}/flag`);
        return response.data.data;
    },

    // Settings
    getSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data.data;
    },

    updateSettings: async (settingsData) => {
        const response = await api.put('/admin/settings', settingsData);
        return response.data.data;
    },

    // Logs
    getLogs: async (search = null, page = 0, size = 20) => {
        const params = { page, size };
        if (search) params.search = search;
        const response = await api.get('/admin/logs', { params });
        return response.data.data; // PagedResponse
    },
};

export default adminService;
