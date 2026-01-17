/**
 * Analytics Page Script
 */

const API = {
    getHeaders() {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    async fetch(endpoint) {
        const res = await fetch(`/api/${endpoint}`, { headers: this.getHeaders() });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check (handled by simple-auth.js if included, but let's be double sure)
    if (!localStorage.getItem('auth_token') && !sessionStorage.getItem('auth_token')) {
        window.location.href = '../login/login.html';
        return;
    }

    // 2. Load Data
    try {
        const [stats, incidents, buses] = await Promise.all([
            API.fetch('dashboard-stats'),
            API.fetch('incidents'),
            API.fetch('buses')
        ]);

        // 3. Update Stat Cards (if elements exist)
        if (document.getElementById('total-students')) document.getElementById('total-students').textContent = stats.students || 0;
        if (document.getElementById('total-buses')) document.getElementById('total-buses').textContent = stats.buses || 0;
        if (document.getElementById('total-routes')) document.getElementById('total-routes').textContent = stats.routes || 0;
        if (document.getElementById('total-incidents')) document.getElementById('total-incidents').textContent = stats.incidents || 0;

        // 4. Render Charts
        renderIncidentsChart(incidents);
        renderDistributionChart(buses);
        renderMaintenanceChart(); // Mock or fetch if available

    } catch (err) {
        console.error("Analytics Load Error", err);
    }
});

function renderIncidentsChart(incidents) {
    const ctx = document.getElementById('incidentsChart');
    if (!ctx) return;

    // Group incidents by date (simple aggregation)
    const dates = {};
    incidents.forEach(inc => {
        const d = new Date(inc.Date).toLocaleDateString();
        dates[d] = (dates[d] || 0) + 1;
    });

    const labels = Object.keys(dates).sort();
    const data = labels.map(d => dates[d]);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Incidents',
                data: data.length ? data : [0],
                borderColor: '#f97316', // Orange-500
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

function renderDistributionChart(buses) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    // Group by Capacity
    const capacityGroups = { 'Small (<30)': 0, 'Medium (30-50)': 0, 'Large (>50)': 0 };
    buses.forEach(bus => {
        if (bus.Capacity < 30) capacityGroups['Small (<30)']++;
        else if (bus.Capacity <= 50) capacityGroups['Medium (30-50)']++;
        else capacityGroups['Large (>50)']++;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(capacityGroups),
            datasets: [{
                data: Object.values(capacityGroups),
                backgroundColor: ['#60a5fa', '#a78bfa', '#34d399'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
}

function renderMaintenanceChart() {
    const ctx = document.getElementById('maintenanceChart');
    if (!ctx) return;

    // Mock data for demonstration as endpoint might not return status
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Good', 'Due Soon', 'Overdue', 'In Service'],
            datasets: [{
                label: 'Vehicles',
                data: [12, 5, 2, 3],
                backgroundColor: ['#4ade80', '#facc15', '#ef4444', '#94a3b8'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}
