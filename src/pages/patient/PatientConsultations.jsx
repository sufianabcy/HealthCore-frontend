import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const PatientConsultations = () => {
    const { appointments } = useOutletContext();
    const virtualAppointments = appointments.filter(a => a.type === 'Virtual' || a.type === 'VIRTUAL');

    const [inCall, setInCall] = useState(false);

    const startCall = () => {
        setInCall(true);
    };

    const endCall = () => {
        setInCall(false);
    };

    if (inCall) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm border border-gray-200">
                    🚧
                </div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-3">Coming Soon</h2>
                <p className="text-gray-500 mb-8">
                    The integrated video and audio consultation feature is currently under active development. Please check back in a future update!
                </p>
                <button
                    onClick={endCall}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors border border-gray-200"
                >
                    Return to Appointments
                </button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Virtual Consultations</h2>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {virtualAppointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                            🎥
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Virtual Visits</h3>
                        <p className="text-gray-500">You don't have any upcoming virtual consultations scheduled.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {virtualAppointments.map((appt) => (
                            <li key={appt.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center hover:bg-gray-50 transition-colors gap-6">
                                <div className="flex gap-4 items-start md:items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 text-xl border border-red-100 shadow-sm">
                                        🏥
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg mb-1">{appt.doctorName}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold uppercase tracking-wide">Ready to Join</span>
                                            <span className="text-sm text-gray-500 font-medium">Scheduled: {appt.date} at {appt.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={startCall}
                                        className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-sm transition-colors whitespace-nowrap"
                                    >
                                        Join Virtual Waiting Room
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PatientConsultations;
