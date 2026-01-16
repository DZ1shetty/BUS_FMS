/**
 * Chart Controller for Dashboard Visualizations
 */

import { apiClient } from './apiClient.js';

let incidentsChart = null;
let distributionChart = null;

export const chartController = {
  async initCharts() {
    const ctx1 = document.getElementById('incidentsChart')?.getContext('2d');
    const ctx2 = document.getElementById('distributionChart')?.getContext('2d');
    if (!ctx1 || !ctx2) return;

    const gradient = ctx1.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 174, 222, 0.35)');
    gradient.addColorStop(1, 'rgba(255, 107, 0, 0)');

    Chart.defaults.color = '#556b82';
    Chart.defaults.borderColor = '#e6eef6';
    Chart.defaults.font.family = "'Rajdhani', sans-serif";

    incidentsChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Incidents',
          data: [],
          borderColor: '#ff6b00',
          backgroundColor: 'rgba(255, 107, 0, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ff6b00',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0b2545',
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { borderDash: [5, 5] }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    distributionChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Students', 'Buses', 'Routes'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#00aede', '#ffd166', '#ff6b00'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      }, 
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: { size: 11 }
            }
          }
        },
        cutout: '70%'
      }
    });

    this.updateCharts();
  },

  refreshCharts() {
    if (incidentsChart) incidentsChart.resize();
    if (distributionChart) distributionChart.resize();
  },

  async updateCharts() {
    try {
      const stats = await apiClient.fetch(`dashboard-stats?t=${Date.now()}`);
      if (distributionChart) {
        distributionChart.data.datasets[0].data = [stats.students, stats.buses, stats.routes];
        distributionChart.update();
      }

      const incidents = await apiClient.fetch(`incidents?t=${Date.now()}`);
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const counts = last7Days.map(date => 
        incidents.filter(i => i.Date && new Date(i.Date).toISOString().split('T')[0] === date).length
      );

      if (incidentsChart) {
        incidentsChart.data.labels = last7Days.map(d => d.slice(5));
        incidentsChart.data.datasets[0].data = counts;
        incidentsChart.update();
      }
    } catch (e) {
      console.error("Chart update failed", e);
    }
  }
};
