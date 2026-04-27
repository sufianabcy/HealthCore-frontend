import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import doctorService from '../../services/doctorService';

const BookAppointment = () => {
    const { addAppointment } = useOutletContext();
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState('VIRTUAL');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const data = await doctorService.getAllDoctors(null, null, 0, 100);
                setDoctors(data.content || []);
            } catch (err) {
                console.error("Failed to load doctors:", err);
                setError("Failed to load doctors");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Filter doctors based on department
    const filteredDoctors = selectedDepartment
        ? doctors.filter(doc => doc.department === selectedDepartment)
        : doctors;

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await addAppointment({
                doctorId: selectedDoctor,
                date: selectedDate,
                time: selectedTime,
                type: appointmentType
            });
            alert(`Appointment successfully booked!`);
            navigate('/patient/dashboard');
        } catch (err) {
            alert('Failed to book appointment.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading booking portal...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">Book an Appointment</h2>

            <div className="bg-white border rounded-2xl shadow-sm p-6 lg:p-8">
                {error && <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
                <form onSubmit={handleBooking} className="space-y-8">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Department / Specialty</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedDoctor(''); // Reset chosen doctor if department changes
                            }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all cursor-pointer"
                        >
                            <option value="">All Specialties</option>
                            <option value="general">General Practice</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="dermatology">Dermatology</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Doctor</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredDoctors.map(doctor => (
                                <div
                                    key={doctor.id}
                                    onClick={() => setSelectedDoctor(doctor.id)}
                                    className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedDoctor === doctor.id ? 'border-red-500 bg-red-50 ring-1 ring-red-500 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                            {doctor.name ? doctor.name.charAt(4).toUpperCase() : 'D'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{doctor.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredDoctors.length === 0 && (
                                <div className="col-span-1 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
                                    No doctors found for this specialty.
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedDoctor && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Slot</label>
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    required
                                >
                                    <option value="">Select Time</option>
                                    <option value="09:00 AM">09:00 AM</option>
                                    <option value="09:30 AM">09:30 AM</option>
                                    <option value="10:00 AM">10:00 AM</option>
                                    <option value="11:00 AM">11:00 AM</option>
                                    <option value="02:00 PM">02:00 PM</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                                <select
                                    value={appointmentType}
                                    onChange={(e) => setAppointmentType(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-red-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    required
                                >
                                    <option value="VIRTUAL">Virtual</option>
                                    <option value="IN_PERSON">In Person</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!selectedDoctor || !selectedDate || !selectedTime}
                            className="w-full bg-red-600 text-white font-semibold py-3.5 rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Confirm Appointment Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
