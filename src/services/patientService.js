import api from './api';

const patientService = {
    getProfile: async () => {
        const response = await api.get('/patients/me');
        return response.data.data;
    },

    getAppointments: async (page = 0, size = 10) => {
        const response = await api.get('/patients/me/appointments', { params: { page, size } });
        return response.data.data; // PagedResponse
    },

    bookAppointment: async (appointmentData) => {
        const response = await api.post('/patients/me/appointments', appointmentData);
        return response.data.data;
    },

    getMedicalRecords: async (type = null, page = 0, size = 10) => {
        const params = { page, size };
        if (type) params.type = type;
        const response = await api.get('/patients/me/records', { params });
        return response.data.data; // PagedResponse
    },

    updateAppointmentStatus: async (id, status) => {
        const response = await api.patch(`/patients/me/appointments/${id}/status`, { status });
        return response.data.data;
    },

    deleteAppointment: async (id) => {
        const response = await api.delete(`/patients/me/appointments/${id}`);
        return response.data.data;
    },
};

export default patientService;
