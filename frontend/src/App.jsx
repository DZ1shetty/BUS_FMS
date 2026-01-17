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
    Trash2,
    X,
    PieChart,
    BarChart2,
    ChevronRight,
    ChevronLeft,
    Sun,
    Moon,
    Download,
    ArrowUpDown
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
import DeleteModal from './components/DeleteModal';

import InteractiveBackground from './components/InteractiveBackground';

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

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // New Features State
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Theme Effect
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Sorting Logic
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Export Function
    const exportData = () => {
        if (data.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + Object.keys(data[0]).join(",") + "\n"
            + data.map(row => Object.values(row).map(val => `"${val}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeSection}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fetch user and initial stats
    useEffect(() => {
        fetchStats();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && activeSection !== 'analytics') fetchData();
    }, [activeSection, user]);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/dashboard-stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats({ students: 120, buses: 12, routes: 5, incidents: 0 });
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
            setData([]);
        } finally {
            setDataLoading(false);
        }
    };

    const initiateDelete = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        // Close modal immediately for better UX
        setDeleteModalOpen(false);

        let idField = 'id';
        let apiEndpoint = '';

        switch (activeSection) {
            case 'students': idField = 'StudentID'; apiEndpoint = 'deleteStudent'; break;
            case 'routes': idField = 'RouteID'; apiEndpoint = 'deleteRoute'; break;
            case 'buses': idField = 'BusID'; apiEndpoint = 'deleteBus'; break;
            case 'drivers': idField = 'DriverID'; apiEndpoint = 'deleteDriver'; break;
            case 'maintenance': idField = 'LogID'; apiEndpoint = 'deleteMaintainence'; break;
            case 'incidents': idField = 'IncidentID'; apiEndpoint = 'deleteIncident'; break;
            default: return; // Safety
        }

        try {
            await axios.delete(`/api/${apiEndpoint}/${itemToDelete}`);
            fetchData();
            fetchStats();
            setItemToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            fetchData();
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
            console.error("Add failed", error);
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

    // Sorting & Pagination (Must be after filteredData definition)
    const sortedData = React.useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handle different types
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeSection]);

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

    const getSingularTitle = (section) => {
        const map = {
            'students': 'Student',
            'routes': 'Route',
            'buses': 'Bus',
            'drivers': 'Driver',
            'maintenance': 'Maintenance Log',
            'incidents': 'Incident'
        };
        return map[section] || 'Entry';
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.99 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: -15, scale: 0.99, transition: { duration: 0.2 } }
    };

    return (
        <div className="flex h-screen bg-transparent dark:bg-transparent text-slate-800 dark:text-slate-200 font-sans overflow-hidden selection:bg-primary/20 relative">
            <InteractiveBackground />

            {/* SIDEBAR */}
            {/* SIDEBAR */}
            <motion.aside
                initial={{ width: 80 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-dark-border z-20 flex flex-col h-full overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
            >
                <div className={`flex items-center gap-4 transition-all ${isSidebarOpen ? 'p-6' : 'p-3 justify-center'}`}>
                    <img src="/logo.jpg" alt="BusFleet" className="w-12 h-12 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform object-cover shrink-0" />
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap"
                        >
                            BUS-FMS
                        </motion.span>
                    )}
                </div>

                <div className="px-4 py-2 flex-1 overflow-y-auto overflow-x-hidden">
                    {isSidebarOpen && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3 whitespace-nowrap">Management</p>
                    )}
                    <nav className={`${isSidebarOpen ? 'space-y-1.5' : 'space-y-6 py-4'}`}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`sidebar-link w-full group relative overflow-hidden shrink-0 ${activeSection === item.id ? 'active' : ''} ${!isSidebarOpen && 'justify-center !px-0'}`}
                            >
                                <item.icon size={isSidebarOpen ? 20 : 24} className={`relative z-10 transition-colors shrink-0 ${activeSection === item.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                                {isSidebarOpen && <span className="relative z-10 font-medium whitespace-nowrap">{item.label}</span>}
                                {activeSection === item.id && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                    <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer group shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-white/5 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-dark-surface shrink-0">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-full h-full object-cover shrink-0" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-gradient-to-br from-slate-200 to-slate-300 shrink-0">
                                    {(user?.email?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.displayName || 'Administrator'}</p>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate">{user?.email || 'System Admin'}</p>
                            </motion.div>
                        )}
                        {isSidebarOpen ? (
                            <button onClick={() => signOut(auth)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                <LogOut size={18} />
                            </button>
                        ) : (
                            // Optional: If you want logout accessible when closed, or maybe just click avatar to expand?
                            // For now keeping simpler, user can expand to logout or we add a small logout trigger
                            null
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
                {/* Header */}
                <header className="h-24 px-8 flex items-center justify-between bg-white/80 dark:bg-dark/80 backdrop-blur-md z-10 sticky top-0 border-b border-slate-200/50 dark:border-dark-border/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">{activeSection}</h1>
                            <p className="text-sm text-slate-500 font-medium">Overview & Management</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveSection('analytics')}
                            className={`hidden md:flex items-center gap-2 p-2.5 rounded-xl transition-colors font-medium text-sm ${activeSection === 'analytics' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        >
                            <BarChart2 size={18} />
                            <span>Analytics</span>
                        </button>
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {activeSection !== 'analytics' && (
                            <>
                                <button
                                    onClick={exportData}
                                    className="hidden md:flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium text-sm"
                                    title="Export to CSV"
                                >
                                    <Download size={18} />
                                    <span>Export</span>
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth will-change-transform">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="max-w-[1600px] mx-auto space-y-8 pb-10"
                        >
                            {activeSection === 'analytics' ? (
                                <AnalyticsView stats={stats} />
                            ) : (
                                /* Table Section */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-4 bg-white dark:bg-dark-surface p-2 pr-4 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-10 w-10 flex items-center justify-center text-slate-400">
                                                <Search size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={`Search in ${activeSection}...`}
                                                className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full placeholder-slate-400 font-medium"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => { setFormData({}); setShowModal(true); }}
                                            className="btn-primary py-2 px-4 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 shrink-0"
                                        >
                                            <Plus size={18} strokeWidth={2.5} />
                                            <span className="font-semibold hidden sm:inline ml-2">Add New {getSingularTitle(activeSection)}</span>
                                            <span className="sm:hidden">Add</span>
                                        </button>
                                    </div>

                                    <div className="card-minimal overflow-hidden min-h-[400px]">
                                        {dataLoading ? (
                                            <div className="h-96 flex flex-col items-center justify-center p-12">
                                                <div className="loader-simple" />
                                            </div>
                                        ) : filteredData.length > 0 ? (
                                            <>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-white/5">
                                                                {Object.keys(filteredData[0]).map(key => (
                                                                    <th
                                                                        key={key}
                                                                        className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors select-none group"
                                                                        onClick={() => requestSort(key)}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {key}
                                                                            <ArrowUpDown size={14} className={`text-slate-300 group-hover:text-primary transition-colors ${sortConfig.key === key ? 'text-primary' : ''}`} />
                                                                        </div>
                                                                    </th>
                                                                ))}
                                                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentItems.map((row, idx) => (
                                                                <motion.tr
                                                                    key={idx}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                                                                    className="table-row-minimal group"
                                                                >
                                                                    {Object.values(row).map((val, i) => (
                                                                        <td key={i} className="p-5 text-sm text-slate-600 dark:text-slate-300 font-medium">{String(val)}</td>
                                                                    ))}
                                                                    <td className="p-5 text-right">
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
                                                                                initiateDelete(row[idField]);
                                                                            }}
                                                                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                            title="Delete Record"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </td>
                                                                </motion.tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Pagination Controls */}
                                                <div className="p-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                                                    <div className="text-sm text-slate-500">
                                                        Showing <span className="font-bold text-slate-700 dark:text-slate-300">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(indexOfLastItem, filteredData.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-300">{filteredData.length}</span> entries
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className="p-2 rounded-lg border border-slate-200 dark:border-dark-border text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-white/10 transition-colors"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>

                                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                            const page = i + 1;
                                                            // Logic for sliding window could be added, simplified for now
                                                            let p = page;
                                                            if (totalPages > 5 && currentPage > 3) p = currentPage - 3 + page;
                                                            if (p > totalPages) return null;

                                                            return (
                                                                <button
                                                                    key={p}
                                                                    onClick={() => paginate(p)}
                                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === p ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-white dark:hover:bg-white/10'}`}
                                                                >
                                                                    {p}
                                                                </button>
                                                            );
                                                        })}

                                                        <button
                                                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className="p-2 rounded-lg border border-slate-200 dark:border-dark-border text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-white/10 transition-colors"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6">
                                                    <Search size={32} className="opacity-30" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No matches found</h3>
                                                <p className="text-sm">Try adjusting your search query</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Modals */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New {getSingularTitle(activeSection)}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="p-8 space-y-5">
                                <div className="space-y-4">
                                    {getFormFields().map(field => (
                                        <div key={field.name}>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    className="input-minimal min-h-[100px] resize-none"
                                                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    required
                                                />
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    className="input-minimal"
                                                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    required
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 btn-primary text-sm shadow-xl shadow-primary/20">
                                        Create Entry
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

const AnalyticsView = ({ stats }) => (
    <div className="space-y-8">
        {/* Stats Grid - Moved here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Students" value={stats.students} icon={Users} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard title="Active Buses" value={stats.buses} icon={Bus} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
            <StatCard title="Total Routes" value={stats.routes} icon={RouteIcon} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
            <StatCard title="Incidents" value={stats.incidents} icon={AlertTriangle} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="card-minimal p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Overview</h3>
                        <p className="text-sm text-slate-500 mt-1">Weekly fleet usage stats</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-2 rounded-lg">
                        <BarChart2 size={20} />
                    </div>
                </div>
                <div className="h-80">
                    <Line
                        data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{
                                label: 'Passengers',
                                data: [650, 720, 680, 810, 750, 420, 380],
                                borderColor: '#2563eb',
                                backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                                    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
                                    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
                                    return gradient;
                                },
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#ffffff',
                                pointBorderColor: '#2563eb',
                                pointBorderWidth: 2,
                                pointHoverRadius: 6,
                            }]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    titleFont: { size: 13, family: 'Inter' },
                                    bodyFont: { size: 13, family: 'Inter' },
                                    cornerRadius: 8,
                                    displayColors: false,
                                }
                            },
                            scales: {
                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                                y: { grid: { color: '#e2e8f0', borderDash: [5, 5] }, ticks: { color: '#94a3b8' }, border: { display: false } }
                            }
                        }}
                    />
                </div>
            </div>

            <div className="card-minimal p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fleet Status</h3>
                        <p className="text-sm text-slate-500 mt-1">Current vehicle distribution</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 p-2 rounded-lg">
                        <PieChart size={20} />
                    </div>
                </div>
                <div className="h-80 flex justify-center relative">
                    <Pie
                        data={{
                            labels: ['Active Duty', 'In Depot', 'Maintenance', 'Out of Service'],
                            datasets: [{
                                data: [stats.buses || 42, 5, 2, 1],
                                backgroundColor: ['#2563eb', '#64748b', '#f59e0b', '#ef4444'],
                                borderWidth: 2,
                                borderColor: '#ffffff',
                                hoverOffset: 10
                            }]
                        }}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        font: { family: 'Inter', size: 12, weight: 600 }
                                    }
                                },
                                tooltip: {
                                    backgroundColor: '#1e293b',
                                    padding: 12,
                                    bodyFont: { size: 13, family: 'Inter' },
                                    cornerRadius: 8,
                                    callbacks: {
                                        label: function (context) {
                                            return ` ${context.label}: ${context.raw} Buses`;
                                        }
                                    }
                                }
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="card-minimal p-6 flex flex-col justify-between h-36 relative overflow-hidden group cursor-pointer"
    >
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 group-hover:scale-105 transition-transform origin-left">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color} shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110`}>
                <Icon size={22} />
            </div>
        </div>
        {/* Decorative elements */}
        <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full ${bg} opacity-20 group-hover:scale-125 transition-transform duration-500 ease-out`} />
        <div className={`absolute -top-6 -left-6 w-20 h-20 rounded-full ${bg} opacity-10`} />
    </motion.div>
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

    // Initial Splash Screen
    if (loading) return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-dark flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="loader-simple" />
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Initializing System...</p>
            </motion.div>
        </div>
    );

    return (
        <Router>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/login" element={
                        user ? <Navigate to="/" /> : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Login />
                            </motion.div>
                        )
                    } />
                    <Route path="/signup" element={
                        user ? <Navigate to="/" /> : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Signup />
                            </motion.div>
                        )
                    } />
                    <Route path="/" element={
                        user ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Dashboard />
                            </motion.div>
                        ) : <Navigate to="/login" />
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AnimatePresence>
        </Router>
    );
};

export default App;
