import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data.data; // { id, name, email, role, token }
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data.data; // { id, name, email, role }
    },
};

export default authService;
