import { useState } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';

const DoctorSchedule = () => {
    const { schedule: scheduleData, updateAppointmentStatus, rescheduleAppointment, createAppointment, patients } = useOutletContext();
    const navigate = useNavigate();

    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
    const [bookingData, setBookingData] = useState({ patientId: '', date: '', time: '', type: 'Virtual', duration: 30 });
    const [rescheduleData, setRescheduleData] = useState({ appointmentId: '', newTime: '', newDate: '' });

    // Convert object to array and sort by time (simplified sorting for display purposes)
    const appointmentsLayout = Object.values(scheduleData);

    const handleJoinCall = () => {
        navigate('/doctor/consultation-room');
    };

    const handleDone = (appointmentId) => {
        updateAppointmentStatus(appointmentId, 'COMPLETED');
    };

    const openRescheduleModal = (appointmentId) => {
        setRescheduleData({ appointmentId, newTime: '', newDate: '' });
        setIsRescheduleOpen(true);
    };

    const submitReschedule = (e) => {
        e.preventDefault();
        rescheduleAppointment(rescheduleData.appointmentId, rescheduleData.newTime, rescheduleData.newDate);
        setIsRescheduleOpen(false);
    };

    const submitBooking = async (e) => {
        e.preventDefault();
        try {
            await createAppointment({
                patientId: parseInt(bookingData.patientId, 10),
                date: bookingData.date,
                time: bookingData.time,
                type: bookingData.type,
                duration: bookingData.duration
            });
            setIsAddBookingOpen(false);
            setBookingData({ patientId: '', date: '', time: '', type: 'Virtual', duration: 30 });
        } catch (err) {
            alert('Failed to book appointment');
            console.error(err);
        }
    };

    // Helper to find patient id
    const getPatientId = (patientName) => {
        const patient = patients.find(p => p.name === patientName);
        return patient ? patient.id : null;
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Upcoming Appointments</h2>
                    <p className="text-gray-500 mt-1">Manage all your scheduled consultations.</p>
                </div>

                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                    <button onClick={() => setIsAddBookingOpen(true)} className="flex-1 md:flex-none bg-[#E10600] text-white hover:bg-red-700 px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        New Appointment
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500 font-bold bg-white">
                                <th className="p-5 w-32">Time</th>
                                <th className="p-5">Patient Details</th>
                                <th className="p-5 w-48">Status</th>
                                <th className="p-5 text-right w-[340px]">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointmentsLayout.map((appt) => (
                                <tr key={appt.id} className="hover:bg-gray-50 transition group bg-white">
                                    <td className="p-5">
                                        <p className="font-bold text-gray-800">{appt.time}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">30 mins</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <img src={`https://ui-avatars.com/api/?name=${appt.patient.replace(' ', '+')}&background=F3F4F6&color=111827`} alt={appt.patient} className="w-10 h-10 rounded-full border border-gray-200" />
                                            <div>
                                                <p className="font-bold text-gray-800 text-base">{appt.patient}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`w-2 h-2 rounded-full ${appt.type.includes('Virtual') || appt.type.includes('Review') || appt.type.includes('Follow-up') || appt.type.includes('Consultation') ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                                    <p className="text-sm text-gray-500 font-medium">{appt.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                                            ${appt.status === 'next' || appt.status === 'ready' ? 'bg-green-100 text-green-700 border border-green-200' : ''}
                                            ${appt.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : ''}
                                            ${appt.status === 'completed' ? 'bg-gray-100 text-gray-600 border border-gray-200' : ''}
                                        `}>
                                            {appt.status === 'next' || appt.status === 'ready' ? 'Ready' : appt.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex gap-2 justify-end opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to="/doctor/patients"
                                                state={{ patientId: getPatientId(appt.patient) }}
                                                className="text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition shadow-sm"
                                            >
                                                View Profile
                                            </Link>

                                            {appt.status !== 'completed' && (
                                                <button onClick={() => openRescheduleModal(appt.id)} className="text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5 focus:outline-none">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    Reschedule
                                                </button>
                                            )}

                                            {appt.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleDone(appt.id)}
                                                    className="text-xs font-bold border-green-200 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg transition shadow-sm border focus:outline-none"
                                                >
                                                    Done
                                                </button>
                                            )}

                                            {appt.status !== 'completed' && (
                                                <button
                                                    onClick={handleJoinCall}
                                                    className="text-xs font-bold bg-[#E10600] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 focus:outline-none"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                    Join
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {appointmentsLayout.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-500">
                                        No appointments today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reschedule Modal */}
            {isRescheduleOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                            <button onClick={() => setIsRescheduleOpen(false)} className="text-gray-400 hover:text-gray-600 outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1">
                            <form id="reschedule-form" onSubmit={submitReschedule} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">New Date</label>
                                    <input required type="date" value={rescheduleData.newDate} onChange={e => setRescheduleData({ ...rescheduleData, newDate: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">New Time</label>
                                    <select required value={rescheduleData.newTime} onChange={e => setRescheduleData({ ...rescheduleData, newTime: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                                        <option value="" disabled>Select time...</option>
                                        <option value="08:00 AM">08:00 AM</option>
                                        <option value="09:00 AM">09:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="01:00 PM">01:00 PM</option>
                                        <option value="02:00 PM">02:00 PM</option>
                                        <option value="03:00 PM">03:00 PM</option>
                                        <option value="04:00 PM">04:00 PM</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsRescheduleOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button type="submit" form="reschedule-form" className="px-5 py-2.5 text-sm font-bold text-white bg-[#E10600] rounded-xl shadow-sm hover:bg-red-700 transition">Confirm Time</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Booking Modal */}
            {isAddBookingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Book New Appointment</h2>
                            <button onClick={() => setIsAddBookingOpen(false)} className="text-gray-400 hover:text-gray-600 outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1">
                            <form id="booking-form" onSubmit={submitBooking} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Select Patient</label>
                                    <select required value={bookingData.patientId} onChange={e => setBookingData({ ...bookingData, patientId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                                        <option value="" disabled>Choose patient...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Date</label>
                                        <input required type="date" value={bookingData.date} onChange={e => setBookingData({ ...bookingData, date: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Time</label>
                                        <select required value={bookingData.time} onChange={e => setBookingData({ ...bookingData, time: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                                            <option value="" disabled>Select time...</option>
                                            <option value="09:00 AM">09:00 AM</option>
                                            <option value="09:30 AM">09:30 AM</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                            <option value="10:30 AM">10:30 AM</option>
                                            <option value="11:00 AM">11:00 AM</option>
                                            <option value="01:00 PM">01:00 PM</option>
                                            <option value="01:30 PM">01:30 PM</option>
                                            <option value="02:00 PM">02:00 PM</option>
                                            <option value="02:30 PM">02:30 PM</option>
                                            <option value="03:00 PM">03:00 PM</option>
                                            <option value="04:00 PM">04:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Consultation Type</label>
                                    <select required value={bookingData.type} onChange={e => setBookingData({ ...bookingData, type: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 bg-white">
                                        <option value="Virtual">Virtual</option>
                                        <option value="In-Person">In-Person</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsAddBookingOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button type="submit" form="booking-form" className="px-5 py-2.5 text-sm font-bold text-white bg-[#E10600] rounded-xl shadow-sm hover:bg-red-700 transition">Book Appointment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorSchedule;
