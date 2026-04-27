import { useState, useEffect } from 'react';
import { Link, useOutletContext, useLocation } from 'react-router-dom';

const DoctorPatientRecords = () => {
    const { patients, addPatient } = useOutletContext();
    const location = useLocation();

    // Auto-select patient from router state if provided
    const [selectedPatientId, setSelectedPatientId] = useState(() => {
        if (location.state?.patientId) return location.state.patientId;
        return patients.length > 0 ? patients[0].id : null;
    });

    useEffect(() => {
        if (location.state?.patientId) {
            setSelectedPatientId(location.state.patientId);
        }
    }, [location.state]);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddRouteOpen, setIsAddModalOpen] = useState(false);

    // Form State for Add Patient
    const [formData, setFormData] = useState({
        name: '', age: '', gender: 'Female', contact: '', allergies: '', history: ''
    });

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const newPatient = {
            name: formData.name,
            age: parseInt(formData.age, 10),
            gender: formData.gender,
            contact: formData.contact,
            allergies: formData.allergies || 'None',
            medicalHistory: formData.history || 'No established history',
        };
        addPatient(newPatient);
        setSelectedPatientId(newPatient.id);
        setIsAddModalOpen(false);
        setFormData({ name: '', age: '', gender: 'Female', contact: '', allergies: '', history: '' });
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 relative">
            {/* Left Sidebar: Patient List / Search */}
            <div className="w-full md:w-80 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex-shrink-0 h-full">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-gray-800">Patient Profiles</h2>
                        <button onClick={() => setIsAddModalOpen(true)} className="w-8 h-8 rounded-full bg-red-50 text-[#E10600] flex items-center justify-center hover:bg-red-100 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                    </div>
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm transition shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredPatients.map(patient => (
                        <button
                            key={patient.id}
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${selectedPatientId === patient.id ? 'bg-red-50 border border-red-100 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                        >
                            <img src={`https://ui-avatars.com/api/?name=${patient.name.replace(' ', '+')}&background=F3F4F6&color=111827`} alt={patient.name} className="w-10 h-10 rounded-full border border-gray-200" />
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate text-sm ${selectedPatientId === patient.id ? 'text-[#E10600]' : 'text-gray-800'}`}>{patient.name}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">ID: {patient.id} • {patient.age}y</p>
                            </div>
                        </button>
                    ))}
                    {filteredPatients.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500 font-medium">No patients found.</div>
                    )}
                </div>
            </div>

            {/* Right Content Area: Patient Profile */}
            <div className="flex-1 overflow-y-auto pr-2 pb-8">
                {selectedPatient ? (
                    <div className="space-y-6">
                        {/* Header specific to profile */}
                        <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-sm p-8 pb-0 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-red-600 to-red-800"></div>

                            <div className="relative pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                                <div className="flex items-end gap-6">
                                    <div className="p-1 bg-white rounded-full inline-block shadow-sm">
                                        <img src={`https://ui-avatars.com/api/?name=${selectedPatient.name.replace(' ', '+')}&background=F3F4F6&color=111827&size=128`} alt={selectedPatient.name} className="w-24 h-24 rounded-full border border-gray-100" />
                                    </div>
                                    <div className="pb-1">
                                        <h2 className="text-3xl font-bold tracking-tight mb-1">{selectedPatient.name}</h2>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <span>Patient ID: {selectedPatient.id}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <button className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 px-6 py-2.5 rounded-xl font-bold transition shadow-sm w-full sm:w-auto text-center">
                                        Edit Profile
                                    </button>
                                    <Link to="/doctor/prescriptions" state={{ patientId: selectedPatient.id }} className="bg-[#E10600] text-white hover:bg-red-700 px-6 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        Write Prescription
                                    </Link>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Age</p>
                                    <p className="font-semibold text-gray-800 text-lg">{selectedPatient.age} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Gender</p>
                                    <p className="font-semibold text-gray-800 text-lg">{selectedPatient.gender}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Contact</p>
                                    <p className="font-semibold text-gray-800 text-lg">{selectedPatient.contact}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Blood Type</p>
                                    <p className="font-semibold text-[#E10600] text-lg">N/A</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Allergies & Conditions */}
                            <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                        Known Allergies
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {(typeof selectedPatient.allergies === 'string' ? selectedPatient.allergies.split(',') : (selectedPatient.allergies || [])).map((allergy, idx) => (
                                        <span key={idx} className="bg-red-50 text-red-700 border border-red-100 px-3 py-1.5 rounded-lg text-sm font-bold">{typeof allergy === 'string' ? allergy.trim() : allergy}</span>
                                    ))}
                                </div>

                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-t border-gray-100 pt-6">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Medical History
                                </h3>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                    <p className="text-sm font-medium text-gray-700">{selectedPatient.medicalHistory || selectedPatient.history || 'No established history.'}</p>
                                </div>
                                <div className="mt-4 border-t border-gray-100 pt-6">
                                    <Link to="/doctor/records" className="text-sm font-bold text-[#E10600] flex items-center gap-1 hover:underline">
                                        View Full Consultation History <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Lab Reports */}
                            <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-sm p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                    Recent Lab Reports
                                </h3>

                                {selectedPatient.labs && selectedPatient.labs.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {selectedPatient.labs.map((report, idx) => (
                                            <li key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-sm mb-0.5">{report.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{report.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border
                                                        ${report.result === 'Normal' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-[#E10600] border-red-100'}
                                                    `}>
                                                        {report.result}
                                                    </span>
                                                    <button className="text-gray-400 hover:text-gray-800 transition">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm font-medium text-gray-500">No recent lab reports on file.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Select a patient to view their profile.</p>
                    </div>
                )}
            </div>

            {/* Add Patient Modal */}
            {isAddRouteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1">
                            <form id="add-patient-form" onSubmit={handleAddSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. Jane Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Age</label>
                                        <input required type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g. 34" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Gender</label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500">
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Number</label>
                                        <input required type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Known Allergies</label>
                                    <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500" placeholder="Comma separated (e.g. Penicillin, Peanuts)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Medical Notes</label>
                                    <textarea rows={3} value={formData.history} onChange={e => setFormData({ ...formData, history: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="Brief history..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition">Cancel</button>
                            <button type="submit" form="add-patient-form" className="px-5 py-2.5 text-sm font-bold text-white bg-[#E10600] rounded-xl shadow-sm hover:bg-red-700 transition">Save Patient Profile</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatientRecords;
