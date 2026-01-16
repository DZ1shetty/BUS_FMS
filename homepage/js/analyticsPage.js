/**
 * Analytics Page Controller
 */

import { apiClient } from './apiClient.js';

document.addEventListener("DOMContentLoaded", async () => {
    setupUserInfo();
    initCharts();
    loadAnalyticsData();
});

function setupUserInfo() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        const nameEl = document.getElementById('logged-in-as');
        if (nameEl) nameEl.textContent = user.displayName || user.email.split('@')[0];
    }
}

async function loadAnalyticsData() {
    try {
        const stats = await apiClient.fetch(`dashboard-stats?t=${Date.now()}`);
        if (stats) {
            document.getElementById("total-students").textContent = stats.students || 0;
            document.getElementById("total-buses").textContent = stats.buses || 0;
            document.getElementById("total-routes").textContent = stats.routes || 0;
            document.getElementById("total-incidents").textContent = stats.incidents || 0;
            
            updateCharts(stats);
        }
    } catch (error) {
        console.error("Failed to load analytics data", error);
    }
}

let incidentsChart, distributionChart, maintenanceChart;

function initCharts() {
    const ctxIncidents = document.getElementById('incidentsChart').getContext('2d');
    const ctxDist = document.getElementById('distributionChart').getContext('2d');
    const ctxMaint = document.getElementById('maintenanceChart').getContext('2d');

    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = "'Rajdhani', sans-serif";

    incidentsChart = new Chart(ctxIncidents, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Reported Incidents',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#ff6b00',
                backgroundColor: 'rgba(255, 107, 0, 0.05)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { borderDash: [5, 5] }, beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });

    distributionChart = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['Students', 'Buses', 'Routes', 'Staff'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1'],
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            }
        }
    });

    maintenanceChart = new Chart(ctxMaint, {
        type: 'bar',
        data: {
            labels: ['Routine', 'Repair', 'Inspection', 'Emergency'],
            datasets: [{
                label: 'Status Count',
                data: [12, 5, 8, 2],
                backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#ef4444'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateCharts(stats) {
    // Mocking some data for the charts based on the fetched totals
    distributionChart.data.datasets[0].data = [
        stats.students || 0,
        stats.buses || 0,
        stats.routes || 0,
        Math.floor((stats.buses || 0) * 1.2) // Driver estimate
    ];
    distributionChart.update();

    // Update incidents line (randomized history for demo)
    incidentsChart.data.datasets[0].data = [
        Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 6),
        stats.incidents || 0
    ];
    incidentsChart.update();
}
