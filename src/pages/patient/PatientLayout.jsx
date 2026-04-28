import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';

const PatientLayout = () => {
    const { logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch appointments from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await patientService.getAppointments(0, 20);
                setAppointments(data.content || []);
            } catch (err) {
                console.error('Failed to load appointments:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addAppointment = async (newAppt) => {
        try {
            const created = await patientService.bookAppointment(newAppt);
            setAppointments(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to book appointment:', err);
            throw err;
        }
    };
    const deleteAppointment = async (id) => {
        try {
            await patientService.deleteAppointment(id);
            setAppointments(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Failed to delete appointment:', err);
            throw err;
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            const updated = await patientService.updateAppointmentStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
        } catch (err) {
            console.error('Failed to update status:', err);
            throw err;
        }
    };

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden text-gray-900">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-[#E10600] rounded-lg flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">HealthCore</h1>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Patient Menu</p>
                    <nav className="flex-1 space-y-1.5">
                        <NavLink to="/patient/dashboard" className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Dashboard</NavLink>
                        <NavLink to="/patient/appointments" className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Appointments</NavLink>
                        <NavLink to="/patient/records" className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Medical Records</NavLink>
                        <NavLink to="/patient/consultations" className={({ isActive }) => `block px-4 py-3 rounded-xl font-semibold transition-colors ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>Consultations</NavLink>
                    </nav>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col md:ml-64 min-w-0 h-screen">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500 hover:text-gray-800 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h2 className="hidden sm:block text-lg font-bold text-gray-800">Patient Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Patient
                        </span>
                        <button onClick={logout} className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition">
                            Sign out
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="h-8 w-8 border-4 border-gray-200 border-t-[#E10600] rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
                            {error}
                        </div>
                    ) : (
                        <Outlet context={{ appointments, addAppointment, deleteAppointment, updateAppointmentStatus }} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default PatientLayout;
