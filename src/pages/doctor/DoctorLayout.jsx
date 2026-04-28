import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import doctorService from '../../services/doctorService';
import commonService from '../../services/commonService';

const DoctorLayout = () => {
    const { logout } = useAuth();
    const [schedule, setSchedule] = useState({});
    const [patients, setPatients] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const mapScheduleToState = (scheduleData) => {
        const scheduleMap = {};
        (scheduleData.content || []).forEach((appt) => {
            scheduleMap[String(appt.id)] = {
                ...appt,
                patient: appt.patientName,
                type: appt.type === 'IN_PERSON' ? 'In-Person' : 'Virtual',
                status: appt.status.toLowerCase(),
            };
        });
        return scheduleMap;
    };

    const loadSchedule = useCallback(async () => {
        const scheduleData = await doctorService.getSchedule();
        setSchedule(mapScheduleToState(scheduleData));
    }, []);

    // Fetch all doctor data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [scheduleData, patientsData, prescriptionsData, profileData] = await Promise.all([
                    doctorService.getSchedule(),
                    doctorService.getPatients(),
                    doctorService.getPrescriptions(),
                    doctorService.getProfile(),
                ]);

                setSchedule(mapScheduleToState(scheduleData));
                setPatients(patientsData.content || []);
                setPrescriptions(prescriptionsData.content || []);
                setIsOnline(profileData.online ?? true);
            } catch (err) {
                console.error('Failed to load doctor data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            const statusForApi = String(newStatus || '').toUpperCase();
            await commonService.updateAppointmentStatus(appointmentId, statusForApi);
            await loadSchedule();
        } catch (err) {
            console.error('Failed to update appointment status:', err);
        }
    };

    const createAppointment = async (apptData) => {
        try {
            await doctorService.createAppointment(apptData);
            await loadSchedule();
        } catch (err) {
            console.error('Failed to create appointment:', err);
            throw err;
        }
    };

    const deleteAppointment = async (appointmentId) => {
        try {
            await doctorService.deleteAppointment(appointmentId);
            await loadSchedule();
        } catch (err) {
            console.error('Failed to delete appointment:', err);
            throw err;
        }
    };

    const rescheduleAppointment = async (appointmentId, newTime, newDate) => {
        try {
            await commonService.rescheduleAppointment(appointmentId, { date: newDate, time: newTime });
            await loadSchedule();
        } catch (err) {
            console.error('Failed to reschedule appointment:', err);
        }
    };

    const addPatient = async (newPatient) => {
        try {
            const created = await doctorService.addPatient(newPatient);
            setPatients(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add patient:', err);
            throw err;
        }
    };

    const updatePatient = (updatedPatient) => {
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    };

    const addPrescription = async (newRx) => {
        try {
            const created = await doctorService.createPrescription(newRx);
            setPrescriptions(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Failed to create prescription:', err);
            throw err;
        }
    };

    const updatePrescriptionStatus = async (prescriptionId, status) => {
        try {
            if (status === 'Sent') {
                const updated = await doctorService.sendPrescription(prescriptionId);
                setPrescriptions((prev) =>
                    prev.map((p) => (p.id === prescriptionId ? { ...p, ...updated } : p))
                );
            } else {
                setPrescriptions((prev) =>
                    prev.map((p) => (p.id === prescriptionId ? { ...p, status } : p))
                );
            }
        } catch (err) {
            console.error('Failed to update prescription status:', err);
            throw err;
        }
    };

    const updatePrescription = (updatedRx) => {
        setPrescriptions(prev => prev.map(p => p.id === updatedRx.id ? updatedRx : p));
    };

    const handleToggleStatus = async () => {
        try {
            const updated = await doctorService.toggleStatus();
            setIsOnline(updated.online ?? !isOnline);
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden text-gray-900">
            {/* Sidebar Navigation */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20">
                <div className="p-6 pb-2">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-[#E10600] rounded-lg flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">HealthCore</h1>
                    </div>
                </div>
                <div className="px-6 overflow-y-auto flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                    <nav className="space-y-1.5">
                        <NavLink to="/doctor/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Dashboard
                        </NavLink>
                        <NavLink to="/doctor/schedule" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Upcoming Appointments
                        </NavLink>
                        <NavLink to="/doctor/patients" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            Patient Profiles
                        </NavLink>
                        <NavLink to="/doctor/records" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Medical Records
                        </NavLink>
                        <NavLink to="/doctor/prescriptions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            E-Prescriptions
                        </NavLink>
                    </nav>
                </div>
                <div className="p-6 mt-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Settings</p>
                    <nav className="space-y-1.5">
                        <NavLink to="/doctor/history" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Consultation History
                        </NavLink>
                        <NavLink to="/doctor/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Availability Settings
                        </NavLink>
                    </nav>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col md:ml-64 min-w-0 h-screen">
                {/* Doctor Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500 hover:text-gray-800 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-800 tracking-tight">Doctor Portal</h2>
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                <span className="text-sm font-medium text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button className="relative text-gray-400 hover:text-gray-600 transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#E10600] border-2 border-white rounded-full"></span>
                        </button>

                        <div className="relative">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 focus:outline-none">
                                <img src="https://ui-avatars.com/api/?name=Doctor&background=E10600&color=fff" alt="Profile" className="w-9 h-9 rounded-full border border-gray-100" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                                    <button onClick={handleToggleStatus} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Set status to {isOnline ? 'Offline' : 'Online'}
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-medium text-[#E10600] hover:bg-red-50">
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

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
                        <Outlet context={{
                            schedule, updateAppointmentStatus, rescheduleAppointment, createAppointment, deleteAppointment,
                            patients, addPatient, updatePatient,
                            prescriptions, addPrescription, updatePrescriptionStatus, updatePrescription
                        }} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;
