import { Link, useOutletContext, useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const { schedule, updateAppointmentStatus, patients } = useOutletContext();
    const navigate = useNavigate();

    // Convert object to array for easier mapping.
    const appointmentsArray = Object.values(schedule);

    const isReadyStatus = (status) => ['next', 'ready', 'active'].includes((status || '').toLowerCase());
    const isWaitingStatus = (status) => ['pending', 'upcoming', 'next', 'ready', 'active'].includes((status || '').toLowerCase());
    const isUpcomingStatus = (status) => ['pending', 'upcoming'].includes((status || '').toLowerCase());

    const waitingAppointments = appointmentsArray.filter((a) => isWaitingStatus(a.status));
    const nextAppointment = waitingAppointments.find((a) => isReadyStatus(a.status)) || waitingAppointments[0];
    const upcomingAppointments = appointmentsArray.filter((a) => isUpcomingStatus(a.status));
    const hasReadyPatient = waitingAppointments.some((a) => isReadyStatus(a.status));

    const totalCount = appointmentsArray.length;
    const completedCount = appointmentsArray.filter((a) => (a.status || '').toLowerCase() === 'completed').length;
    const waitingCount = waitingAppointments.length;

    const handleStartCall = () => {
        // Option to mark as completed immediately or on the consultation page. We'll leave it to user via "Done" button elsewhere, or just navigate
        navigate('/doctor/consultation-room');
    };

    const handleAdmitPatient = (appointmentId) => {
        // Marks upcoming as ready/next
        updateAppointmentStatus(appointmentId, 'NEXT');
    };

    const handleDone = (appointmentId) => {
        updateAppointmentStatus(appointmentId, 'COMPLETED');
    };

    // Helper to find patient id
    const getPatientId = (patientName) => {
        if (!patients) return null;
        const patient = patients.find(p => p.name === patientName);
        return patient ? patient.id : null;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{totalCount}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Total Appointments</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#E10600]"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-[#E10600] flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{waitingCount}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Patients Waiting</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Completed Consultations</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-800">{upcomingAppointments.length}</p>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Upcoming Consultations</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Area: Next Appointment & Waiting List */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Next Appointment Card */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Next Appointment</h3>
                        {nextAppointment ? (
                            <div className="bg-white border text-gray-800 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-6 relative overflow-hidden">
                                <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E10600]"></div>

                                <div className="flex items-center gap-5">
                                    <img src={`https://ui-avatars.com/api/?name=${nextAppointment.patient.replace(' ', '+')}&background=F3F4F6&color=111827`} alt={nextAppointment.patient} className="w-16 h-16 rounded-full border border-gray-200" />
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-xl font-bold">{nextAppointment.patient}</h4>
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                {isReadyStatus(nextAppointment.status) ? 'Ready' : 'Waiting'}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 font-medium text-sm flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Scheduled for {nextAppointment.time}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1 bg-gray-50 inline-block px-2 py-1 rounded-md border border-gray-100">{nextAppointment.type}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto">
                                    <Link
                                        to="/doctor/patients"
                                        state={{ patientId: getPatientId(nextAppointment.patient) }}
                                        className="flex-1 sm:flex-none bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-center transition-colors text-sm"
                                    >
                                        View Profile
                                    </Link>
                                    <button
                                        onClick={handleStartCall}
                                        className="flex-1 sm:flex-none bg-[#E10600] text-white hover:bg-red-700 px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        Join Call
                                    </button>
                                    {(nextAppointment.status || '').toLowerCase() !== 'completed' && (
                                        <button
                                            onClick={() => handleDone(nextAppointment.id)}
                                            className="flex-1 sm:flex-none bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 px-6 py-2.5 rounded-xl font-bold transition-colors text-sm"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl border border-gray-100">☕</div>
                                <h4 className="text-xl font-bold text-gray-800 mb-2">No active patient</h4>
                                <p className="text-sm">Please admit a patient from the waiting list below.</p>
                            </div>
                        )}
                    </section>

                    {/* Waiting Patients List */}
                    <section>
                        <div className="flex justify-between items-end mb-4 px-1">
                            <h3 className="text-lg font-bold text-gray-800">Waiting Patients</h3>
                            <Link to="/doctor/schedule" className="text-sm font-semibold text-[#E10600] hover:underline">View Full Schedule &rarr;</Link>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            {upcomingAppointments.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Queue is empty.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {upcomingAppointments.map((appt) => (
                                        <li key={appt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold text-lg border border-yellow-100">
                                                    {appt.patient.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{appt.patient}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-sm">
                                                        <span className="text-gray-500 font-medium">{appt.time}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span className="text-gray-500">{appt.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                        onClick={() => handleAdmitPatient(appt.id)}
                                                className="w-full sm:w-auto text-sm font-bold text-[#E10600] bg-red-50 hover:bg-red-100 border border-red-100 px-5 py-2 rounded-lg transition-colors text-center"
                                                        disabled={hasReadyPatient}
                                            >
                                                Admit to Room
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar: Quick Actions & Notifications */}
                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Quick Actions</h3>
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-2">
                            <Link to="/doctor/prescriptions" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition group">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-[#E10600] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </div>
                                Write Prescription
                            </Link>
                            <Link to="/doctor/patients" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition group">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-[#E10600] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                Search Patients
                            </Link>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">Recent Lab Alerts</h3>
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
                            <div className="flex gap-4 pb-4 border-b border-gray-50">
                                <div className="w-2 h-2 mt-2 rounded-full bg-[#E10600] flex-shrink-0"></div>
                                <div>
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <p className="font-bold text-gray-800 text-sm">Sarah Williams</p>
                                        <span className="text-[10px] bg-red-50 text-[#E10600] px-2 py-0.5 rounded font-bold border border-red-100 whitespace-nowrap">Abnormal</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Complete Blood Count resulting in critical range.</p>
                                    <button className="text-xs text-[#E10600] font-bold hover:underline">Review Results</button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                                <div>
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <p className="font-bold text-gray-800 text-sm">Mike Thompson</p>
                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold border border-gray-200 whitespace-nowrap">Normal</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Lipid Panel results available.</p>
                                    <button className="text-xs text-gray-700 font-bold hover:underline">View Report</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
