import api from './api';

const commonService = {
    getDepartments: async () => {
        const response = await api.get('/departments');
        return response.data.data; // string[]
    },

    getDoctorsByDepartment: async (department = null) => {
        const params = {};
        if (department) params.department = department;
        const response = await api.get('/doctors/by-department', { params });
        return response.data.data;
    },

    // Appointment shared endpoints
    updateAppointmentStatus: async (appointmentId, status) => {
        const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
        return response.data.data;
    },

    rescheduleAppointment: async (appointmentId, data) => {
        const response = await api.patch(`/appointments/${appointmentId}/reschedule`, data);
        return response.data.data;
    },

    getAvailableSlots: async (doctorId, date) => {
        const response = await api.get('/appointments/available-slots', { params: { doctorId, date } });
        return response.data.data;
    },
};

export default commonService;
