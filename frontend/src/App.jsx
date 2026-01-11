import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Route as RouteIcon,
    Bus,
    IdCard,
    Wrench,
    AlertTriangle,
    LogOut,
    Menu,
    Plus,
    Search,
    LayoutDashboard,
    Trash2,
    X,
    Loader2
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Components
import Login from './components/Login';
import Signup from './components/Signup';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const SkeletonLoader = ({ className }) => (
    <div className={`skeleton ${className}`} />
);

const Dashboard = () => {
    const [activeSection, setActiveSection] = useState('students');
    const [stats, setStats] = useState({ students: 0, buses: 0, routes: 0, incidents: 0 });
    const [data, setData] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.documentElement.classList.add('dark');
        fetchStats();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeSection]);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard-stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setDataLoading(true);
        try {
            const response = await axios.get(`/api/${activeSection}`);
            setData(response.data);
        } catch (error) {
            console.error(`Error fetching ${activeSection}:`, error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;

        // Determine the ID field name based on section
        let idField = 'id';
        let apiEndpoint = '';

        switch (activeSection) {
            case 'students': idField = 'StudentID'; apiEndpoint = 'deleteStudent'; break;
            case 'routes': idField = 'RouteID'; apiEndpoint = 'deleteRoute'; break;
            case 'buses': idField = 'BusID'; apiEndpoint = 'deleteBus'; break;
            case 'drivers': idField = 'DriverID'; apiEndpoint = 'deleteDriver'; break;
            case 'maintenance': idField = 'LogID'; apiEndpoint = 'deleteMaintainence'; break;
            case 'incidents': idField = 'IncidentID'; apiEndpoint = 'deleteIncident'; break;
        }

        try {
            await axios.delete(`/api/${apiEndpoint}/${id}`);
            fetchData();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || "Error deleting record");
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/add${activeSection}`, formData);
            setShowModal(false);
            setFormData({});
            fetchData();
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.error || "Error adding record");
        }
    };

    const navItems = [
        { id: 'students', label: 'Students', icon: Users },
        { id: 'routes', label: 'Routes', icon: RouteIcon },
        { id: 'buses', label: 'Buses', icon: Bus },
        { id: 'drivers', label: 'Drivers', icon: IdCard },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    ];

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getFormFields = () => {
        switch (activeSection) {
            case 'students':
                return [
                    { name: 'Name', label: 'Full Name', type: 'text' },
                    { name: 'Grade', label: 'Grade', type: 'text' },
                    { name: 'BusRouteID', label: 'Route ID', type: 'number' },
                    { name: 'BoardingPoint', label: 'Boarding Point', type: 'text' },
                ];
            case 'routes':
                return [
                    { name: 'StartPoint', label: 'Start Point', type: 'text' },
                    { name: 'EndPoint', label: 'End Point', type: 'text' },
                ];
            case 'buses':
                return [
                    { name: 'BusNumber', label: 'Bus Number', type: 'text' },
                    { name: 'Capacity', label: 'Capacity', type: 'number' },
                    { name: 'RouteID', label: 'Route ID', type: 'number' },
                ];
            case 'drivers':
                return [
                    { name: 'Name', label: 'Full Name', type: 'text' },
                    { name: 'LicenseNumber', label: 'License Number', type: 'text' },
                    { name: 'Phone', label: 'Phone', type: 'text' },
                ];
            case 'maintenance':
            case 'incidents':
                return [
                    { name: 'BusID', label: 'Bus ID', type: 'number' },
                    { name: 'Description', label: 'Description', type: 'textarea' },
                    { name: 'Date', label: 'Date', type: 'date' },
                ];
            default: return [];
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="flex h-screen bg-dark transition-colors duration-300 overflow-hidden font-rajdhani">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: 0, width: isSidebarOpen ? '256px' : '0' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-dark-surface border-r border-slate-700/50 flex flex-col overflow-hidden z-20"
            >
                <div className="p-6 flex items-center space-x-3 border-b border-slate-700/50">
                    <div className="w-10 h-10 bg-primary text-slate-900 flex items-center justify-center font-bold text-xl rounded-tr-xl rounded-bl-xl shadow-lg shadow-primary/20">B</div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold tracking-widest uppercase text-white overflow-hidden whitespace-nowrap"
                    >
                        BusFleet
                    </motion.h1>
                </div>

                <nav className="flex-1 py-8 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center space-x-4 px-6 py-4 transition-all duration-200 border-l-4 ${activeSection === item.id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-semibold uppercase tracking-wider text-sm">{item.label}</span>
                            {activeSection === item.id && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-8 bg-primary rounded-r"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header content */}
                <header className="h-20 bg-dark-surface/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-8 z-10 transition-all">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 transition-colors border border-slate-700 rounded-lg text-slate-400 hover:text-primary"><Menu size={20} /></button>
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">{activeSection}</h2>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <span className="text-primary font-bold tracking-wider text-sm truncate max-w-[150px] uppercase">{user?.displayName || user?.email?.split('@')[0] || 'DHANUSH G SHETTY'}</span>
                            <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center text-slate-900 font-bold overflow-hidden border-2 border-primary/20">
                                {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : (user?.displayName?.[0] || user?.email?.[0] || 'D').toUpperCase()}
                            </div>
                        </div>
                        <button onClick={() => signOut(auth)} className="flex items-center space-x-2 transition-all text-xs font-bold px-3 py-2 rounded-lg border text-slate-400 hover:text-red-400 border-slate-700 hover:border-red-400/30"><LogOut size={16} /><span className="uppercase tracking-widest">Logout</span></button>
                    </div>
                </header>

                <motion.div
                    className="flex-1 overflow-y-auto p-6 space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Top Stats Overview - Compact Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Students" value={stats.students} icon={Users} loading={loading} onClick={() => setActiveSection('students')} />
                        <StatCard title="Buses" value={stats.buses} icon={Bus} loading={loading} onClick={() => setActiveSection('buses')} />
                        <StatCard title="Routes" value={stats.routes} icon={RouteIcon} loading={loading} onClick={() => setActiveSection('routes')} />
                        <StatCard title="Incidents" value={stats.incidents} icon={AlertTriangle} loading={loading} danger onClick={() => setActiveSection('incidents')} />
                    </motion.div>

                    {/* Split Layout: Dashboard & Intelligence */}
                    <div className="flex flex-col xl:flex-row gap-6">
                        {/* LEFT: Management Hub (The Work Area) */}
                        <motion.div variants={itemVariants} className="flex-1 space-y-6">
                            {/* Action Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl border transition-colors bg-dark-surface/30 border-slate-700/30">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input type="text" placeholder={`Filter ${activeSection}...`} className="w-full border rounded-lg py-2 pl-10 pr-4 transition-all text-sm outline-none focus:border-primary bg-dark/50 border-slate-700 text-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                </div>
                                <button onClick={() => { setFormData({}); setShowModal(true); }} className="btn-primary flex items-center space-x-2 w-full md:w-auto justify-center px-6 py-2.5 text-xs">
                                    <Plus size={18} />
                                    <span>NEW RECORD</span>
                                </button>
                            </div>

                            {/* Main Data Table */}
                            <div className="card overflow-x-auto min-h-[600px] shadow-2xl border-slate-700/50">
                                {dataLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-4 p-4 border-b border-slate-700/30">
                                                <SkeletonLoader className="w-1/4 h-6" />
                                                <SkeletonLoader className="w-1/4 h-6" />
                                                <SkeletonLoader className="w-1/4 h-6" />
                                                <SkeletonLoader className="w-full h-8 ml-auto" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredData.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 z-10 bg-dark-surface">
                                            <tr className="border-b border-slate-700">
                                                {Object.keys(filteredData[0]).map(key => (
                                                    <th key={key} className="p-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{key}</th>
                                                ))}
                                                <th className="p-4 text-[11px] font-bold uppercase tracking-wider text-right text-slate-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            <AnimatePresence mode='popLayout'>
                                                {filteredData.map((row, idx) => (
                                                    <motion.tr
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="hover:bg-primary/5 transition-colors group table-row"
                                                    >
                                                        {Object.values(row).map((val, i) => (
                                                            <td key={i} className="p-4 text-xs font-bold text-white">{String(val)}</td>
                                                        ))}
                                                        <td className="p-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    let idField = '';
                                                                    switch (activeSection) {
                                                                        case 'students': idField = 'StudentID'; break;
                                                                        case 'routes': idField = 'RouteID'; break;
                                                                        case 'buses': idField = 'BusID'; break;
                                                                        case 'drivers': idField = 'DriverID'; break;
                                                                        case 'maintenance': idField = 'LogID'; break;
                                                                        case 'incidents': idField = 'IncidentID'; break;
                                                                    }
                                                                    handleDelete(row[idField]);
                                                                }}
                                                                className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all p-2 hover:scale-110 active:scale-95"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center space-y-4 opacity-30">
                                        <AlertTriangle size={48} />
                                        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">No active protocols found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* RIGHT: Intelligence Panel (Analytics Sidebar) */}
                        <motion.div variants={itemVariants} className="w-full xl:w-[400px] space-y-6">
                            {/* Analytics 1 - Performance */}
                            <div className="card border-primary/10">
                                <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center">
                                    <LayoutDashboard size={14} className="mr-2" /> Live Performance
                                </h3>
                                <div className="h-56">
                                    <Line
                                        data={{
                                            labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
                                            datasets: [{
                                                label: 'ACTIVITY',
                                                data: [stats.students, 10, 15, 20, 25, stats.students],
                                                borderColor: '#00D4FF',
                                                backgroundColor: (context) => {
                                                    const ctx = context.chart.ctx;
                                                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                                                    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
                                                    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
                                                    return gradient;
                                                },
                                                fill: true,
                                                tension: 0.5,
                                                pointRadius: 4,
                                                pointHoverRadius: 6,
                                                pointBackgroundColor: '#00D4FF',
                                                pointBorderColor: '#1E293B',
                                                pointBorderWidth: 2
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    grid: { color: '#334155', borderDash: [2, 4] },
                                                    ticks: { color: '#475569', font: { size: 9, weight: '600', family: 'Rajdhani' } }
                                                },
                                                x: {
                                                    grid: { display: false },
                                                    ticks: { color: '#475569', font: { size: 10, weight: '700', family: 'Rajdhani' } }
                                                }
                                            },
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#0F172A',
                                                    titleColor: '#00D4FF',
                                                    bodyColor: '#F1F5F9',
                                                    borderColor: '#475569',
                                                    borderWidth: 1,
                                                    padding: 10,
                                                    displayColors: false,
                                                    titleFont: { family: 'Rajdhani', weight: 'bold' },
                                                    bodyFont: { family: 'Rajdhani' },
                                                    callbacks: {
                                                        label: (context) => `VOL: ${context.parsed.y} UNITS`
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Analytics 2 - Fleet Mix */}
                            <div className="card border-primary/10">
                                <h3 className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Resource Allocation</h3>
                                <div className="h-64 flex items-center justify-center">
                                    <Pie
                                        data={{
                                            labels: ['STUDENTS', 'BUSES', 'ROUTES'],
                                            datasets: [{
                                                data: [stats.students, stats.buses, stats.routes],
                                                backgroundColor: ['#00D4FF', '#0EA5E9', '#1E293B'],
                                                borderWidth: 2,
                                                borderColor: '#0f172a',
                                                hoverOffset: 10
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        color: '#94A3B8',
                                                        boxWidth: 8,
                                                        padding: 15,
                                                        font: { size: 9, weight: '700', family: 'Rajdhani' },
                                                        usePointStyle: true
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: '#0F172A',
                                                    titleColor: '#00D4FF',
                                                    bodyColor: '#F1F5F9',
                                                    borderColor: '#475569',
                                                    borderWidth: 1,
                                                    padding: 10,
                                                    titleFont: { family: 'Rajdhani', weight: 'bold' },
                                                    bodyFont: { family: 'Rajdhani' },
                                                    callbacks: {
                                                        label: (context) => ` ${context.label}: ${context.parsed} COUNT`
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Quick Instructions/Help Card */}
                            <div className="p-6 border rounded-xl transition-colors bg-primary/5 border-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50"><AlertTriangle size={40} className="text-primary/20" /></div>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10">Fleet Support</p>
                                <p className="text-xs leading-relaxed italic text-slate-400 relative z-10">
                                    "Managing <span className="text-primary font-bold">{stats.buses}</span> active units across <span className="text-primary font-bold">{stats.routes}</span> routes. Ensure all incidents are protocol-verified."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>

            {/* Add Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-surface border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white">Add New {activeSection.slice(0, -1)}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAdd} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {getFormFields().map(field => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea className="input-field" rows="3" onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} required />
                                            ) : (
                                                <input type={field.type} className="input-field" onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} required />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex space-x-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border border-slate-800 rounded-lg font-bold text-slate-400 hover:bg-slate-800 transition-all uppercase tracking-widest">Cancel</button>
                                    <button type="submit" className="flex-1 p-3 bg-primary text-slate-900 rounded-lg font-bold hover:brightness-110 transition-all uppercase tracking-widest shadow-lg shadow-primary/20">Establish Record</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, loading, danger, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="card group relative overflow-hidden text-left w-full h-full"
    >
        <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${danger ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(0,212,255,0.5)]'}`} />
        <div className="flex items-center space-x-5 relative z-10">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${danger ? 'border-red-500/30 text-red-500 bg-red-500/5 group-hover:bg-red-500/10' : 'border-primary/30 text-primary bg-primary/5 group-hover:bg-primary/10'}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400 group-hover:text-white transition-colors">{title}</p>
                {loading ? (
                    <div className="h-8 w-16 px-2"><SkeletonLoader className="w-full h-full" /></div>
                ) : (
                    <p className="text-3xl font-bold leading-none text-white">{value}</p>
                )}
            </div>
        </div>

        {/* Decorative background element */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-all group-hover:opacity-20 ${danger ? 'bg-red-500' : 'bg-primary'}`} />
    </motion.button>
);

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center font-['Rajdhani',sans-serif] space-y-4">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <div className="text-primary animate-pulse text-xl font-bold tracking-widest uppercase italic">Initializing System...</div>
        </div>
    );

    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
