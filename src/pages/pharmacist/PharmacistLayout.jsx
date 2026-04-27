import { NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import pharmacyService from '../../services/pharmacyService';

const PharmacistLayout = () => {
    const { logout } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all pharmacy data from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [rxData, ordersData, inventoryData, profileData] = await Promise.all([
                    pharmacyService.getPrescriptions(),
                    pharmacyService.getOrders(),
                    pharmacyService.getInventory(),
                    pharmacyService.getProfile(),
                ]);
                setPrescriptions(rxData.content || []);
                setOrders(ordersData.content || []);
                setInventory(inventoryData.content || []);
                setIsOnline(profileData.online ?? true);
            } catch (err) {
                console.error('Failed to load pharmacy data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const updatePrescriptionStatus = async (prescriptionId, newStatus) => {
        try {
            if (newStatus === 'Verified') {
                await pharmacyService.verifyPrescription(prescriptionId);
            } else if (newStatus === 'Dispensed') {
                await pharmacyService.dispensePrescription(prescriptionId);
            }
            setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error('Failed to update prescription:', err);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await pharmacyService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error('Failed to update order:', err);
        }
    };

    const updateInventoryStock = async (itemId, amount) => {
        try {
            const item = inventory.find(i => i.id === itemId);
            const newQuantity = Math.max(0, (item?.stock || 0) + amount);
            await pharmacyService.updateStock(itemId, newQuantity);
            setInventory(prev => prev.map(i => {
                if (i.id === itemId) {
                    const newStock = Math.max(0, i.stock + amount);
                    const newStatus = newStock === 0 ? 'Out of Stock' : (newStock < 50 ? 'Low Stock' : 'In Stock');
                    return { ...i, stock: newStock, status: newStatus };
                }
                return i;
            }));
        } catch (err) {
            console.error('Failed to update stock:', err);
        }
    };

    const addInventoryItem = async (item) => {
        try {
            const created = await pharmacyService.addInventoryItem(item);
            setInventory(prev => [created, ...prev]);
            return created;
        } catch (err) {
            console.error('Failed to add inventory item:', err);
            throw err;
        }
    };

    const handleToggleStatus = async () => {
        try {
            const updated = await pharmacyService.toggleStatus();
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
                        <NavLink to="/pharmacy/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Dashboard
                        </NavLink>
                        <NavLink to="/pharmacy/prescriptions" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Incoming Prescriptions
                        </NavLink>
                        <NavLink to="/pharmacy/orders" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63-.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Orders
                        </NavLink>
                        <NavLink to="/pharmacy/inventory" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                            Inventory
                        </NavLink>
                    </nav>
                </div>
                <div className="p-6 mt-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Settings</p>
                    <nav className="space-y-1.5">
                        <NavLink to="/pharmacy/profile" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-red-50 text-[#E10600]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            Profile
                        </NavLink>
                    </nav>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col md:ml-64 min-w-0 h-screen">
                {/* Pharmacist Top Navbar */}
                <header className="h-16 bg-white border-b border-gray-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-gray-500 hover:text-gray-800 focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="hidden sm:block">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-800 tracking-tight">Pharmacy Portal</h2>
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
                                <img src="https://ui-avatars.com/api/?name=P+H&background=E10600&color=fff" alt="Profile" className="w-9 h-9 rounded-full border border-gray-100" />
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
                        <Outlet context={{ prescriptions, updatePrescriptionStatus, orders, updateOrderStatus, inventory, updateInventoryStock, addInventoryItem }} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default PharmacistLayout;
