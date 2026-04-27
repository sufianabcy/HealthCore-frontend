import api from './api';

/** Backend uses enum names (SENT, DRAFT); UI uses title case. Medications may be strings or objects. */
const STATUS_FROM_API = {
    SENT: 'Sent',
    DRAFT: 'Draft',
    PENDING: 'Pending',
    VERIFIED: 'Verified',
    DISPENSED: 'Dispensed',
    REJECTED: 'Rejected',
};

function normalizeDoctorPrescription(data) {
    if (!data) return data;
    const status = STATUS_FROM_API[data.status] || data.status;
    const medications = Array.isArray(data.medications)
        ? data.medications.map((m) => (typeof m === 'string' ? { name: m } : m))
        : [];
    return { ...data, status, medications };
}

function normalizePrescriptionPage(page) {
    if (!page?.content) return page;
    return { ...page, content: page.content.map(normalizeDoctorPrescription) };
}

const doctorService = {
    getProfile: async () => {
        const response = await api.get('/doctors/me');
        return response.data.data;
    },

    getSchedule: async (date = null, page = 0, size = 20) => {
        const params = { page, size };
        if (date) params.date = date;
        const response = await api.get('/doctors/me/schedule', { params });
        return response.data.data; // PagedResponse
    },

    getPatients: async (search = null, page = 0, size = 20) => {
        const params = { page, size };
        if (search) params.search = search;
        const response = await api.get('/doctors/me/patients', { params });
        return response.data.data; // PagedResponse
    },

    addPatient: async (patientData) => {
        const response = await api.post('/doctors/me/patients', patientData);
        return response.data.data;
    },

    createAppointment: async (appointmentData) => {
        const response = await api.post('/doctors/me/appointments', appointmentData);
        return response.data.data;
    },

    getPrescriptions: async (search = null, status = null, page = 0, size = 10) => {
        const params = { page, size };
        if (search) params.search = search;
        if (status) params.status = status;
        const response = await api.get('/doctors/me/prescriptions', { params });
        return normalizePrescriptionPage(response.data.data);
    },

    createPrescription: async (prescriptionData) => {
        const response = await api.post('/doctors/me/prescriptions', prescriptionData);
        return normalizeDoctorPrescription(response.data.data);
    },

    sendPrescription: async (prescriptionId) => {
        const response = await api.patch(`/doctors/me/prescriptions/${prescriptionId}/send`);
        return normalizeDoctorPrescription(response.data.data);
    },

    toggleStatus: async () => {
        const response = await api.patch('/doctors/me/status');
        return response.data.data;
    },

    // Public endpoints
    getAllDoctors: async (search = null, department = null, page = 0, size = 20) => {
        const params = { page, size };
        if (search) params.search = search;
        if (department) params.department = department;
        const response = await api.get('/doctors', { params });
        return response.data.data;
    },

    getDoctorsByDepartment: async (department = null) => {
        const params = {};
        if (department) params.department = department;
        const response = await api.get('/doctors/list', { params });
        return response.data.data;
    },
};

export default doctorService;
