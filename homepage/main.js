/**
 * COMPLETE STANDALONE MAIN.JS - NO MODULES
 * Restoration of deleted file with Critical Fixes for Data Submission & Premium SweetAlerts & Export Feature & Quick Stats
 */

// ============================================
// API CLIENT
// ============================================
const apiClient = {
    getHeaders() {
        const token = localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token') ||
            localStorage.getItem('token');

        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    async waitForToken(maxWaitTime = 5000) {
        if (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) return true;
        const startTime = Date.now();
        while (Date.now() - startTime < maxWaitTime) {
            if (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) return true;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
    },

    async handleResponse(response) {
        const contentType = response.headers.get("content-type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
            try { data = await response.json(); } catch (e) { console.warn("Failed to parse JSON", e); }
        }
        if (!response.ok) {
            const errorMessage = data?.error || data?.message || `HTTP ${response.status} ${response.statusText}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }
        return data;
    },

    async fetch(endpoint) {
        try {
            await this.waitForToken();
            const response = await fetch(`/api/${endpoint}`, { headers: this.getHeaders() });
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`[API] GET ${endpoint} failed:`, error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            await this.waitForToken();
            const response = await fetch(`/api/${endpoint}`, {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`[API] POST ${endpoint} failed:`, error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            await this.waitForToken();
            const response = await fetch(`/api/${endpoint}`, {
                method: "DELETE",
                headers: this.getHeaders()
            });
            if (!response.ok) return await this.handleResponse(response);
            return true;
        } catch (error) {
            console.error(`[API] DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }
};

// ============================================
// UI UTILITIES
// ============================================
const uiUtils = {
    showToast(message, type = 'success') {
        if (typeof Swal !== 'undefined') {
            const Toast = Swal.mixin({
                toast: true, position: 'bottom-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
                background: '#fff', color: '#1e293b', iconColor: type === 'success' ? '#10b981' : '#ef4444',
                didOpen: (toast) => { toast.addEventListener('mouseenter', Swal.stopTimer); toast.addEventListener('mouseleave', Swal.resumeTimer); }
            });
            Toast.fire({ icon: type, title: message });
            return;
        }
    },

    showLoading() {
        let loader = document.querySelector('.loader-overlay');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'loader-overlay';
            loader.innerHTML = '<div class="loader"></div>';
            document.body.appendChild(loader);
        }
        loader.classList.add('active');
    },
    hideLoading() { const loader = document.querySelector('.loader-overlay'); if (loader) loader.classList.remove('active'); },
    initTheme() { const theme = localStorage.getItem('theme') || 'light'; document.documentElement.setAttribute('data-theme', theme); }
};

// ============================================
// DATA & TABLE CONTROLLER
// ============================================
const appData = {
    currentSection: 'students',
    currentData: [],
    sections: {
        students: { endpoint: 'students', idKey: 'StudentID', columns: [{ key: 'StudentID', label: 'ID' }, { key: 'Name', label: 'NAME' }, { key: 'Grade', label: 'GRADE' }, { key: 'BusRouteId', label: 'ROUTE ID' }, { key: 'BoardingPoint', label: 'BOARDING POINT' }] },
        routes: { endpoint: 'routes', idKey: 'RouteID', columns: [{ key: 'RouteID', label: 'ID' }, { key: 'RouteName', label: 'ROUTE NAME' }, { key: 'StartPoint', label: 'START POINT' }, { key: 'EndPoint', label: 'END POINT' }] },
        buses: { endpoint: 'buses', idKey: 'BusID', columns: [{ key: 'BusID', label: 'ID' }, { key: 'BusNumber', label: 'BUS NUMBER' }, { key: 'Capacity', label: 'CAPACITY' }, { key: 'RouteID', label: 'ROUTE ID' }] },
        drivers: { endpoint: 'drivers', idKey: 'DriverID', columns: [{ key: 'DriverID', label: 'ID' }, { key: 'Name', label: 'NAME' }, { key: 'LicenseNumber', label: 'LICENSE' }, { key: 'Phone', label: 'PHONE' }] },
        maintenance: { endpoint: 'maintenance', idKey: 'LogID', columns: [{ key: 'LogID', label: 'ID' }, { key: 'BusID', label: 'BUS ID' }, { key: 'Date', label: 'DATE' }, { key: 'Description', label: 'DESCRIPTION' }] },
        incidents: { endpoint: 'incidents', idKey: 'IncidentID', columns: [{ key: 'IncidentID', label: 'ID' }, { key: 'BusID', label: 'BUS ID' }, { key: 'Date', label: 'DATE' }, { key: 'Description', label: 'DESCRIPTION' }] }
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 8
    }
};

const tableController = {
    render(data, sectionKey) {
        const config = appData.sections[sectionKey];
        const content = document.getElementById('content');
        if (!content) return;

        if (!data || data.length === 0) {
            content.innerHTML = `<div class="empty-state py-20 text-center"><i class="fas fa-inbox text-4xl text-gray-200 mb-4"></i><p class="text-gray-400">No records found.</p></div>`;
            return;
        }

        // Pagination Logic
        const page = appData.pagination.currentPage;
        const perPage = appData.pagination.itemsPerPage;
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / perPage);

        // Ensure current page is valid
        if (page > totalPages && totalPages > 0) appData.pagination.currentPage = totalPages;
        if (appData.pagination.currentPage < 1) appData.pagination.currentPage = 1;

        const start = (appData.pagination.currentPage - 1) * perPage;
        const paginatedData = data.slice(start, start + perPage);

        let html = '<div class="table-responsive"><table class="data-table"><thead><tr>';
        config.columns.forEach(col => { html += `<th onclick="sortTable('${col.key}')">${col.label} <i class="fas fa-sort"></i></th>`; });
        html += '<th>Actions</th></tr></thead><tbody>';

        paginatedData.forEach(row => {
            html += '<tr>';
            config.columns.forEach(col => {
                let value = row[col.key];
                if (col.key === 'Date' && value) value = new Date(value).toLocaleDateString();
                html += `<td>${value || '-'}</td>`;
            });
            const itemId = row[config.idKey];
            html += `<td><button onclick="deleteItem('${sectionKey}', ${itemId})" class="btn-delete"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        html += '</tbody></table></div>';

        // Pagination Controls
        if (totalPages > 1) {
            html += `
            <div class="pagination-controls flex justify-between items-center mt-4 p-4 border-t border-gray-100">
                <span class="text-sm text-gray-500">Showing ${start + 1} to ${Math.min(start + perPage, totalItems)} of ${totalItems} entries</span>
                <div class="flex gap-2">
                    <button class="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 ${appData.pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            onclick="changePage(-1)" ${appData.pagination.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    ${generatePageNumbers(totalPages, appData.pagination.currentPage)}
                    <button class="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 ${appData.pagination.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
                            onclick="changePage(1)" ${appData.pagination.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>`;
        }

        content.innerHTML = html;
    }
};

function generatePageNumbers(totalPages, current) {
    let html = '';
    // Simple pagination: show all if <= 7, else show simplified
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            html += `<button onclick="setPage(${i})" class="px-3 py-1 rounded-md border ${i === current ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'}">${i}</button>`;
        }
    } else {
        html += `<button onclick="setPage(1)" class="px-3 py-1 rounded-md border ${1 === current ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'}">1</button>`;
        if (current > 3) html += `<span class="px-2">...</span>`;
        // Show neighbors
        for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
            html += `<button onclick="setPage(${i})" class="px-3 py-1 rounded-md border ${i === current ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'}">${i}</button>`;
        }
        if (current < totalPages - 2) html += `<span class="px-2">...</span>`;
        html += `<button onclick="setPage(${totalPages})" class="px-3 py-1 rounded-md border ${totalPages === current ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 hover:bg-gray-50'}">${totalPages}</button>`;
    }
    return html;
}

window.changePage = function (delta) {
    appData.pagination.currentPage += delta;
    // content refresh handled by calling render with current filtered data... 
    // BUT render needs data. We need to store 'filteredData' somewhere or re-search?
    // Let's modify searchData to store result in appData.filteredData or similar.
    // For now, let's assume appData.currentFilteredData exists or fall back to currentData
    const dataToRender = appData.currentFilteredData || appData.currentData;
    tableController.render(dataToRender, appData.currentSection);
};

window.setPage = function (page) {
    appData.pagination.currentPage = page;
    const dataToRender = appData.currentFilteredData || appData.currentData;
    tableController.render(dataToRender, appData.currentSection);
};

// ============================================
// FORM FIELDS GENERATOR
// ============================================
const formGenerator = {
    getFields(section, routes = [], buses = []) {
        const fields = {
            students: `<input type="text" name="Name" placeholder="Student Name" required><input type="number" name="Grade" placeholder="Grade" required><select name="BusRouteID" required><option value="">Select Route</option>${routes.map(r => `<option value="${r.RouteID}">${r.RouteName || r.RouteID}</option>`).join('')}</select><input type="text" name="BoardingPoint" placeholder="Boarding Point" required>`,
            routes: `<input type="text" name="StartPoint" placeholder="Start Point" required><input type="text" name="EndPoint" placeholder="End Point" required>`,
            buses: `<input type="text" name="BusNumber" placeholder="Bus Number" required><input type="number" name="Capacity" placeholder="Capacity" required><select name="RouteID"><option value="">Select Route</option>${routes.map(r => `<option value="${r.RouteID}">${r.RouteName || r.RouteID}</option>`).join('')}</select>`,
            drivers: `<input type="text" name="Name" placeholder="Driver Name" required><input type="text" name="LicenseNumber" placeholder="License Number" required><input type="tel" name="Phone" placeholder="Phone Number" required>`,
            maintenance: `<select name="BusID" required><option value="">Select Bus</option>${buses.map(b => `<option value="${b.BusID}">${b.BusNumber}</option>`).join('')}</select><input type="date" name="Date" required><textarea name="Description" placeholder="Maintenance Description" required></textarea>`,
            incidents: `<select name="BusID" required><option value="">Select Bus</option>${buses.map(b => `<option value="${b.BusID}">${b.BusNumber}</option>`).join('')}</select><input type="date" name="Date" required><textarea name="Description" placeholder="Incident Description" required></textarea>`
        };
        return fields[section] || '<p>Form not available</p>';
    }
};

// ============================================
// GLOBAL FUNCTIONS (Exposed to HTML)
// ============================================
window.logout = function () {
    localStorage.removeItem('auth_token'); sessionStorage.removeItem('auth_token');
    window.location.href = "../login/login.html";
};

window.showSection = async function (section) {
    appData.currentSection = section;
    document.querySelectorAll(".nav-item").forEach(btn => { btn.classList.toggle("active", btn.dataset.section === section); });

    const titles = { students: "Students Management", routes: "Route Management", buses: "Bus Management", drivers: "Driver Details", maintenance: "Maintenance Logs", incidents: "Incident Reports" };
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = titles[section] || "Dashboard";

    uiUtils.showLoading();
    try {
        const config = appData.sections[section];
        const data = await apiClient.fetch(config.endpoint);
        appData.currentData = data;
        appData.currentFilteredData = data; // Initialize filtered data
        appData.pagination.currentPage = 1; // Reset to page 1
        tableController.render(data, section);
        loadDashboardStats(); // Refresh stats on section change too
    } catch (err) { uiUtils.showToast("Failed to load data: " + err.message, "error"); } finally { uiUtils.hideLoading(); }
};

window.openAddForm = async function () {
    const section = appData.currentSection;
    const modal = document.getElementById('add-form');
    const form = document.getElementById('data-form');
    const title = document.getElementById('form-title');
    if (!modal || !form) return;

    let routes = [], buses = [];
    try {
        if (['students', 'buses'].includes(section)) routes = await apiClient.fetch('routes');
        if (['maintenance', 'incidents'].includes(section)) buses = await apiClient.fetch('buses');
    } catch (e) { console.warn("Dependency load failed", e); }

    title.textContent = `Add New ${section.slice(0, -1)}`;
    form.innerHTML = formGenerator.getFields(section, routes, buses);
    modal.style.display = 'flex';
};
window.closeForm = function () { document.getElementById('add-form').style.display = 'none'; };

window.saveData = async function (section) {
    const form = document.getElementById("data-form");
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    uiUtils.showLoading();
    try {
        const endpointMap = { students: 'addstudents', routes: 'addroutes', buses: 'addbuses', drivers: 'adddrivers', maintenance: 'addmaintenance', incidents: 'addincidents' };
        await apiClient.post(endpointMap[section], data);
        uiUtils.showToast("Saved successfully!", "success");
        window.closeForm();
        window.showSection(section);
        loadDashboardStats();
    } catch (err) { uiUtils.showToast(err.message, "error"); } finally { uiUtils.hideLoading(); }
};

window.deleteItem = async function (section, id) {
    const result = await Swal.fire({
        title: 'Are you sure?', text: "This action cannot be undone.", icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel',
        reverseButtons: true, width: 400, padding: '1.5em'
    });
    if (!result.isConfirmed) return;

    uiUtils.showLoading();
    try {
        const endpointMap = { students: 'deleteStudent', routes: 'deleteRoute', buses: 'deleteBus', drivers: 'deleteDriver', maintenance: 'deleteMaintainence', incidents: 'deleteIncident' };
        await apiClient.delete(`${endpointMap[section]}/${id}`);
        Swal.fire({ title: 'Deleted!', text: 'Record has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
        window.showSection(section);
        loadDashboardStats();
    } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { uiUtils.hideLoading(); }
};

// ============================================
// EXPORT TO CSV
// ============================================
window.exportData = function () {
    if (!appData.currentData || appData.currentData.length === 0) {
        uiUtils.showToast("No data to export", "error");
        return;
    }
    const data = appData.currentData;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(fieldName => `"${String(row[fieldName] || "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${appData.currentSection}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof Swal !== 'undefined') {
        Swal.fire({ title: 'Exported!', text: `Successfully exported ${data.length} records.`, icon: 'success', timer: 2000, showConfirmButton: false });
    } else { uiUtils.showToast("Export successful!", "success"); }
};

// ============================================
// DASHBOARD STATS RENDERER
// ============================================
async function loadDashboardStats() {
    try {
        const stats = await apiClient.fetch('dashboard-stats');
        renderQuickStats(stats);
    } catch (e) { console.warn("Stats error", e); }
}

function renderQuickStats(data) {
    const container = document.getElementById('quick-stats');
    if (!container || !data) return;

    // Use FontAwesome icons mapping to match our theme
    container.innerHTML = `
        <div class="stat-card stat-students">
            <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
            <div class="stat-content"><h4>Students</h4><p>${data.students || 0}</p></div>
        </div>
        <div class="stat-card stat-routes">
            <div class="stat-icon"><i class="fas fa-route"></i></div>
            <div class="stat-content"><h4>Routes</h4><p>${data.routes || 0}</p></div>
        </div>
        <div class="stat-card stat-buses">
            <div class="stat-icon"><i class="fas fa-bus"></i></div>
            <div class="stat-content"><h4>Buses</h4><p>${data.buses || 0}</p></div>
        </div>
        <div class="stat-card stat-incidents">
            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-content"><h4>Incidents</h4><p>${data.incidents || 0}</p></div>
        </div>
    `;
}

window.showStudents = () => window.showSection('students');
window.showRoutes = () => window.showSection('routes');
window.showBuses = () => window.showSection('buses');
window.showDrivers = () => window.showSection('drivers');
window.showMaintenanceLogs = () => window.showSection('maintenance');
window.showIncidents = () => window.showSection('incidents');

document.addEventListener("DOMContentLoaded", () => {
    uiUtils.initTheme();
    setupUserInfo();
    window.showSection('students'); // This will trigger loadDashboardStats too

    document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
        document.querySelector(".sidebar").classList.toggle("collapsed");
    });

    const form = document.getElementById("data-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            window.saveData(appData.currentSection);
        });
    }

    document.getElementById("user-profile")?.addEventListener("click", window.openProfile);
});

window.openProfile = function () {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'flex';
    // Pre-fill
    const username = localStorage.getItem('auth_username') || '';
    // We don't have email in local storage effectively unless stored on login.
    // Assuming login stores email now (it does in updated server.js, but client login.js needs to save it).
    // If not, we might show empty or fetch it? 
    // Let's assume we need to fetch profile or use stored.
    // Since we don't have a 'getProfile' endpoint, we rely on stored info.
    // I'll update login.js later to store email. For now, fetch from localStorage 'auth_email'.
    const email = localStorage.getItem('auth_email') || '';

    document.querySelector('#profile-form [name="username"]').value = username;
    document.querySelector('#profile-form [name="email"]').value = email;
};

window.closeProfile = function () {
    document.getElementById('profile-modal').style.display = 'none';
};

window.saveProfile = async function () {
    const form = document.getElementById('profile-form');
    const username = form.username.value;
    const email = form.email.value;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmNewPassword = form.confirmNewPassword.value;

    uiUtils.showLoading();
    try {
        // 1. Update Info
        // 1. Update Info
        const updateInfoRes = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: apiClient.getHeaders(),
            body: JSON.stringify({ username, email })
        });
        const infoData = await apiClient.handleResponse(updateInfoRes);

        // Update local storage
        localStorage.setItem('auth_username', username);
        localStorage.setItem('auth_email', email);
        setupUserInfo(); // Refresh UI


        // 2. Change Password if provided
        if (currentPassword && newPassword) {
            if (newPassword !== confirmNewPassword) throw new Error("New passwords do not match");

            const passRes = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: apiClient.getHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            });
            await apiClient.handleResponse(passRes);
            uiUtils.showToast("Profile & Password updated!", "success");
        } else {
            uiUtils.showToast("Profile updated!", "success");
        }

        window.closeProfile();
    } catch (err) {
        uiUtils.showToast(err.message || "Update failed", "error");
    } finally {
        uiUtils.hideLoading();
    }
};

function setupUserInfo() {
    const u = localStorage.getItem('auth_username') || sessionStorage.getItem('auth_username') || 'Admin';
    const el = document.getElementById('logged-in-as');
    if (el) el.textContent = u;
}

window.sortTable = function (key) {
    appData.currentData.sort((a, b) => (a[key] > b[key] ? 1 : -1));
    tableController.render(appData.currentData, appData.currentSection);
}

window.searchData = function () {
    const term = document.getElementById("search-input").value.toLowerCase();
    const filtered = appData.currentData.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(term))
    );
    appData.currentFilteredData = filtered; // Store filtered state
    appData.pagination.currentPage = 1; // Reset to page 1
    tableController.render(filtered, appData.currentSection);
}
