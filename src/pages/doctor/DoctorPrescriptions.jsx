import { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';

const DoctorPrescriptions = () => {
    const { prescriptions, addPrescription, updatePrescription, updatePrescriptionStatus, patients } = useOutletContext();
    const location = useLocation();

    // View State: 'dashboard' or 'create'
    const [view, setView] = useState('dashboard');
    const [editingRxId, setEditingRxId] = useState(null);

    // Create Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [medications, setMedications] = useState([
        { medName: '', dosage: '', frequency: '', duration: '', notes: '' }
    ]);
    const [additionalInstructions, setAdditionalInstructions] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setSelectedPatientId('');
        setMedications([{ medName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
        setAdditionalInstructions('');
        setFollowUpDate('');
        setEditingRxId(null);
    };

    // Dashboard Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (location.state?.patientId) {
            setSelectedPatientId(location.state.patientId);
            setView('create');
        }
    }, [location.state]);

    const handleAddRow = () => {
        setMedications([...medications, { medName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
    };

    const handleRemoveRow = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index));
        }
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    const handleEditDraft = (rx) => {
        setEditingRxId(rx.id);
        setSelectedPatientId(rx.patientId || '');
        if (rx.medications && rx.medications.length > 0) {
            setMedications(rx.medications.map(m => ({
                medName: m.name || '',
                dosage: m.dosage || '',
                frequency: m.frequency || '',
                duration: m.duration || '',
                notes: m.notes || ''
            })));
        } else {
            setMedications([{ medName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
        }
        setAdditionalInstructions(rx.additionalInstructions || '');
        setFollowUpDate(rx.followUpDate || '');
        setView('create');
    };

    const handleSubmit = async (status) => {
        const patientIdNum = parseInt(selectedPatientId, 10);
        if (!selectedPatientId || Number.isNaN(patientIdNum)) {
            alert('Please select a patient.');
            return;
        }

        setIsSubmitting(true);
        try {
            const medPayload = medications
                .filter((m) => m.medName.trim() !== '')
                .map((m) => ({
                    name: m.medName,
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    notes: m.notes || null,
                }));

            if (editingRxId) {
                if (status === 'Sent') {
                    await updatePrescriptionStatus(editingRxId, 'Sent');
                    alert('Prescription sent to pharmacy.');
                } else {
                    updatePrescription({
                        id: editingRxId,
                        patientId: patientIdNum,
                        patientName: patients.find((p) => Number(p.id) === patientIdNum)?.name,
                        date: new Date().toISOString().split('T')[0],
                        status: 'Draft',
                        medications: medPayload.map((m) => ({ ...m, medName: m.name })),
                        additionalInstructions: additionalInstructions.trim() || null,
                        followUpDate: followUpDate || null,
                    });
                    alert('Draft updated locally. The server does not support editing draft prescriptions yet; refresh may reset changes.');
                }
            } else {
                await addPrescription({
                    patientId: patientIdNum,
                    date: new Date().toISOString().split('T')[0],
                    status: status === 'Sent' ? 'SENT' : 'DRAFT',
                    medications: medPayload,
                    additionalInstructions: additionalInstructions.trim() || null,
                    followUpDate: followUpDate || null,
                });
                alert(status === 'Sent' ? 'Prescription sent to pharmacy.' : 'Draft saved.');
            }

            resetForm();
            setView('dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Failed to save prescription';
            alert(msg);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPrescriptions = prescriptions.filter((rx) => {
        const st = (rx.status || '').toUpperCase();
        const matchesStatus =
            filterStatus === 'All' ||
            (filterStatus === 'Sent' && st === 'SENT') ||
            (filterStatus === 'Draft' && st === 'DRAFT');
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            (rx.patientName || '').toLowerCase().includes(q) || String(rx.id || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    if (view === 'dashboard') {
        return (
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">E-Prescribing Dashboard</h2>
                        <p className="text-gray-500 mt-1">Manage and track patient prescriptions.</p>
                    </div>

                    <button
                        onClick={() => { resetForm(); setView('create'); }}
                        className="bg-[#E10600] text-white hover:bg-red-700 px-5 py-2.5 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Create New Prescription
                    </button>
                </div>

                <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-210px)]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                            {['All', 'Sent', 'Draft'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-4 py-1.5 rounded-md font-bold text-sm transition-colors ${filterStatus === f ? 'bg-gray-100 text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64">
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input
                                type="text"
                                placeholder="Search patient or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm transition"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="sticky top-0 bg-white shadow-sm z-10">
                                <tr className="border-b border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                    <th className="p-5 w-32">Date</th>
                                    <th className="p-5 w-40">Prescription ID</th>
                                    <th className="p-5">Patient Details</th>
                                    <th className="p-5 w-64">Medications Snapshot</th>
                                    <th className="p-5 w-24">Status</th>
                                    <th className="p-5 text-right w-40">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPrescriptions.map(rx => (
                                    <tr key={rx.id} className="hover:bg-gray-50 transition group">
                                        <td className="p-5">
                                            <p className="font-semibold text-gray-800">{new Date(rx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-gray-800">{rx.id}</p>
                                        </td>
                                        <td className="p-5 flex items-center gap-3">
                                            <img src={`https://ui-avatars.com/api/?name=${(rx.patientName || '').replace(' ', '+')}&background=F3F4F6&color=111827`} alt={rx.patientName} className="w-8 h-8 rounded-full border border-gray-200" />
                                            <p className="font-bold text-gray-800">{rx.patientName}</p>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-sm text-gray-600 truncate max-wxs">
                                                {(rx.medications || [])
                                                    .map((m) => (typeof m === 'string' ? m : m?.name || m?.medName || ''))
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </td>
                                        <td className="p-5">
                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                ${(rx.status || '').toUpperCase() === 'SENT' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}
                                            `}>
                                                {rx.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditDraft(rx)} className="text-xs font-bold bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition shadow-sm">View</button>
                                                {(rx.status || '').toUpperCase() === 'DRAFT' && (
                                                    <button onClick={() => handleEditDraft(rx)} className="text-xs font-bold text-[#E10600] border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition shadow-sm">Edit</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPrescriptions.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                                            No prescriptions found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => { resetForm(); setView('dashboard'); }}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{editingRxId ? 'Edit Prescription' : 'Create Prescription'}</h2>
                    <p className="text-gray-500 mt-1">{editingRxId ? 'Modify an existing draft or send it to the pharmacy.' : 'Draft or securely send a new e-prescription.'}</p>
                </div>
            </div>

            <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-red-600 to-red-800"></div>

                <div className="p-8">
                    <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit('Sent'); }}>

                        {/* Section 1: Patient Selection */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 pt-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">1. Patient Information</h3>
                            <div className="max-w-md">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Patient</label>
                                <select
                                    required
                                    value={selectedPatientId}
                                    onChange={e => setSelectedPatientId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-800 shadow-sm bg-white"
                                >
                                    <option value="" disabled>-- Choose a patient --</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (ID: {p.id}) - {p.age}y {p.gender}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section 2: Medications */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">2. Medications</h3>
                                <button
                                    type="button"
                                    onClick={handleAddRow}
                                    className="text-sm font-bold text-[#E10600] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Add Medication
                                </button>
                            </div>

                            <div className="space-y-4">
                                {medications.map((med, index) => (
                                    <div key={index} className="bg-white border text-gray-800 border-gray-200 rounded-xl p-6 relative shadow-sm group">
                                        {medications.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRow(index)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition focus:outline-none"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        )}

                                        <div className="pr-8">
                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Medication Name</label>
                                                <input
                                                    required type="text"
                                                    value={med.medName} onChange={(e) => handleMedChange(index, 'medName', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-900"
                                                    placeholder="e.g. Amoxicillin 500mg"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Dosage / Sig</label>
                                                    <input
                                                        required type="text"
                                                        value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                                                        placeholder="e.g. 1 Tablet"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Frequency</label>
                                                    <select
                                                        required
                                                        value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm bg-white"
                                                    >
                                                        <option value="" disabled>Select...</option>
                                                        <option value="Daily">Daily</option>
                                                        <option value="Bid (Twice a day)">Bid (Twice a day)</option>
                                                        <option value="Tid (Three times a day)">Tid (Three times a day)</option>
                                                        <option value="Qid (Four times a day)">Qid (Four times a day)</option>
                                                        <option value="PRN (As needed)">PRN (As needed)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Duration</label>
                                                    <input
                                                        required type="text"
                                                        value={med.duration} onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm"
                                                        placeholder="e.g. 7 Days"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                                                    Notes to Pharmacy <span className="text-gray-400 font-normal">Optional</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.notes} onChange={(e) => handleMedChange(index, 'notes', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm text-gray-600 bg-gray-50"
                                                    placeholder="e.g. Dispense as written, take with food..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Extra Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                                    Additional Internal Notes <span className="text-gray-400 font-normal">Optional</span>
                                </label>
                                <textarea
                                    rows="3"
                                    value={additionalInstructions} onChange={e => setAdditionalInstructions(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm text-gray-600 bg-white resize-none"
                                    placeholder="Patient instructions or diagnosis context..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex justify-between">
                                    Follow-up Date <span className="text-gray-400 font-normal">Optional</span>
                                </label>
                                <input
                                    type="date"
                                    value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 font-medium text-sm bg-white"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => { resetForm(); setView('dashboard'); }}
                                className="px-8 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold text-gray-600 transition shadow-sm"
                            >
                                Cancel
                            </button>
                            <div className="flex-1 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSubmit('Draft')}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition shadow-sm"
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#E10600] text-white font-bold py-3 rounded-xl hover:bg-red-700 transition shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Send to Pharmacy
                                        </>
                                    )}
                                    <div className="absolute inset-0 h-full w-full max-w-0 bg-white/20 transition-all duration-300 ease-out group-hover:max-w-full"></div>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorPrescriptions;
