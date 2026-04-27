import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('healthcore_token'));
    const [loading, setLoading] = useState(true);

    // On mount, validate stored token by calling /auth/me
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('healthcore_token');
            const storedUser = localStorage.getItem('healthcore_user');

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    // Validate the token is still valid
                    const currentUser = await authService.getCurrentUser();
                    // Normalize role to lowercase for frontend routing
                    currentUser.role = currentUser.role?.toLowerCase().replace('role_', '');
                    setUser(currentUser);
                    localStorage.setItem('healthcore_user', JSON.stringify(currentUser));
                } catch (error) {
                    // Token expired or invalid — clear everything
                    console.warn('Session expired, logging out.');
                    localStorage.removeItem('healthcore_token');
                    localStorage.removeItem('healthcore_user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const authData = await authService.login(email, password);
        // authData = { id, name, email, role, token }
        const { token: jwt, ...userData } = authData;

        // Normalize role to lowercase for frontend routing
        userData.role = userData.role?.toLowerCase().replace('role_', '');

        localStorage.setItem('healthcore_token', jwt);
        localStorage.setItem('healthcore_user', JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('healthcore_token');
        localStorage.removeItem('healthcore_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
