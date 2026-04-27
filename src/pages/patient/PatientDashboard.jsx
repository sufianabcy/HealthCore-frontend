import { Link, useOutletContext } from 'react-router-dom';

const PatientDashboard = () => {
    const { appointments } = useOutletContext();

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Patient Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-red-300 transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                            📅
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Book Appointment</h3>
                        <p className="text-sm text-gray-500 mb-6">Schedule a new virtual consultation with available doctors.</p>
                    </div>
                    <Link to="/patient/appointments" className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 py-2.5 rounded-xl font-semibold transition-colors">
                        Book Now
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-red-300 transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                            📁
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Medical Records</h3>
                        <p className="text-sm text-gray-500 mb-6">View your health history, lab reports, and prescriptions.</p>
                    </div>
                    <Link to="/patient/records" className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 py-2.5 rounded-xl font-semibold transition-colors">
                        View Records
                    </Link>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-red-300 transition-colors">
                    <div>
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                            🎥
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">My Consultations</h3>
                        <p className="text-sm text-gray-500 mb-6">Join your upcoming virtual waiting room.</p>
                    </div>
                    <Link to="/patient/consultations" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white border border-transparent py-2.5 rounded-xl font-semibold shadow-sm transition-colors">
                        Join Call
                    </Link>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Your Appointments</h3>
                    <Link to="/patient/appointments" className="text-sm text-red-600 font-medium hover:underline">Book New</Link>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    {appointments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            You have no upcoming appointments.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {appointments.map((appt) => (
                                <li key={appt.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-gray-50 transition-colors gap-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold border border-red-100">
                                            {appt.doctorName?.charAt(4) || 'D'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{appt.doctorName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{appt.type}</span>
                                                <span className="text-sm text-gray-500">{appt.date} at {appt.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 sm:flex-col sm:items-end sm:gap-1">
                                        {appt.type === 'Virtual' || appt.type === 'VIRTUAL' ? (
                                            <Link to="/patient/consultations" className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                                                Join Waiting Room
                                            </Link>
                                        ) : (
                                            <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                                                In-Person Visit
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
