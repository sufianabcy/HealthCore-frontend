import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all admin data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [patientsData, doctorsData, pharmaciesData, appointmentsData, prescriptionsData, logsData] = await Promise.all([
                    adminService.getPatients(),
                    adminService.getDoctors(),
                    adminService.getPharmacies(),
                    adminService.getAppointments(),
                    adminService.getPrescriptions(),
                    adminService.getLogs(),
                ]);
                setPatients(patientsData.content || []);
                setDoctors(doctorsData.content || []);
                setPharmacies(pharmaciesData.content || []);
                setAppointments(appointmentsData.content || []);
                setPrescriptions(prescriptionsData.content || []);
                setLogs(logsData.content || []);
            } catch (err) {
                console.error('Failed to load admin data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- State Mutation Handlers with API calls ---

    const addLog = (action) => {
        // Logs are created server-side; this is for optimistic UI updates
        setLogs(prev => [{
            id: `LOG-${Date.now()}`,
            user: 'Admin',
            action,
            timestamp: new Date().toISOString()
        }, ...prev]);
    };

    const togglePatientStatus = async (id) => {
        try {
            const patient = patients.find(p => p.id === id);
            const newStatus = patient?.status === 'Active' ? 'Suspended' : 'Active';
            await adminService.updatePatientStatus(id, newStatus);
            setPatients(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            addLog(`Changed patient ${id} status to ${newStatus}`);
        } catch (err) {
            console.error('Failed to toggle patient status:', err);
        }
    };

    const updateDoctorStatus = async (id, newStatus) => {
        try {
            await adminService.updateDoctorStatus(id, newStatus);
            setDoctors(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
            addLog(`Changed doctor ${id} status to ${newStatus}`);
        } catch (err) {
            console.error('Failed to update doctor status:', err);
        }
    };

    const updatePharmacyStatus = async (id, newStatus) => {
        try {
            await adminService.updatePharmacyStatus(id, newStatus);
            setPharmacies(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
            addLog(`Changed pharmacy ${id} status to ${newStatus}`);
        } catch (err) {
            console.error('Failed to update pharmacy status:', err);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            await adminService.cancelAppointment(appointmentId);
            setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'Cancelled' } : a));
            addLog(`Cancelled appointment ${appointmentId}`);
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
        }
    };

    const togglePrescriptionFlag = async (prescriptionId) => {
        try {
            await adminService.togglePrescriptionFlag(prescriptionId);
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, flagged: !p.flagged } : p));
            const pr = prescriptions.find(p => p.id === prescriptionId);
            addLog(`${!pr?.flagged ? 'Flagged' : 'Unflagged'} prescription ${prescriptionId}`);
        } catch (err) {
            console.error('Failed to toggle prescription flag:', err);
        }
    };

    // --- Layout & Navigation UI ---

    const handleLogout = () => {
        addLog('Admin logged out');
        logout();
        navigate('/');
    };

    const navLinkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`;

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden text-gray-900 font-sans">
            {/* Sidebar Navigation */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
                <div className="p-6 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#E10600] rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(225,6,0,0.3)]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">HealthCore</h1>
                    </div>
                </div>

                <div className="px-4 py-6 overflow-y-auto flex-1 custom-scrollbar">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">System Control</p>
                    <nav className="space-y-1.5 mb-8">
                        <NavLink to="/admin/dashboard" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Dashboard
                        </NavLink>
                    </nav>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Network Actors</p>
                    <nav className="space-y-1.5 mb-8">
                        <NavLink to="/admin/patients" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Patients
                        </NavLink>
                        <NavLink to="/admin/doctors" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            Doctors
                        </NavLink>
                        <NavLink to="/admin/pharmacies" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            Pharmacies
                        </NavLink>
                    </nav>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">Operations</p>
                    <nav className="space-y-1.5 mb-8">
                        <NavLink to="/admin/appointments" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Appointments
                        </NavLink>
                        <NavLink to="/admin/prescriptions" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Prescriptions
                        </NavLink>
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-2">System</p>
                    <nav className="space-y-1.5">
                        <NavLink to="/admin/settings" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Settings
                        </NavLink>
                        <NavLink to="/admin/logs" className={navLinkClasses}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Activity Logs
                        </NavLink>
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
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 bg-red-50 text-[#E10600] px-3 py-1.5 rounded-lg border border-red-100 hidden sm:flex">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10600]"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider">Superadmin Active</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-800 text-sm font-bold transition flex items-center gap-2">
                            Sign out
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6 md:p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="h-8 w-8 border-4 border-gray-200 border-t-[#E10600] rounded-full animate-spin"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
                                {error}
                            </div>
                        ) : (
                            <Outlet context={{
                                patients, togglePatientStatus,
                                doctors, updateDoctorStatus,
                                pharmacies, updatePharmacyStatus,
                                appointments, cancelAppointment,
                                prescriptions, togglePrescriptionFlag,
                                logs, addLog
                            }} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
