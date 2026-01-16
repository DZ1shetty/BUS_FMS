/**
 * Main Application Orchestrator
 */
console.log("App v501 Loading...");

import { apiClient } from './js/apiClientV2.js';
import { uiUtils } from './js/uiUtils.js';
import { tableController } from './js/tableControllerV2.js';
import { dataController } from './js/dataControllerV2.js';
import { formController } from './js/formControllerV2.js';

// State
window.currentSection = "students";
let currentData = [];
let sortDirection = 1;
let lastSortKey = "";

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  uiUtils.initTheme();
  setupUserInfo();
  loadDashboardStats();
  window.showStudents();

  // Sidebar Toggle
  document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("collapsed");
  });

  // Theme Toggle
  document.getElementById("theme-toggle")?.addEventListener("click", uiUtils.toggleTheme);

  // Keyboard Shortcuts
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      document.getElementById("search-input")?.focus();
    }
  });
});

function setupUserInfo() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user) {
    const el = document.getElementById('logged-in-as');
    if (el) el.textContent = user.displayName || user.email.split('@')[0];
  }
}

async function loadDashboardStats() {
  try {
    const stats = await apiClient.fetch(`dashboard-stats?t=${Date.now()}`);
    // Only update elements if they exist (they are likely in analytics.html now)
    const studentsEl = document.getElementById("total-students");
    const busesEl = document.getElementById("total-buses");
    const routesEl = document.getElementById("total-routes");
    
    if (studentsEl) studentsEl.textContent = stats.students || 0;
    if (busesEl) busesEl.textContent = stats.buses || 0;
    if (routesEl) routesEl.textContent = stats.routes || 0;
  } catch (error) {
    console.error("Failed to load stats", error);
  }
}

// Global window functions for HTML exposure
window.logout = function() {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  sessionStorage.removeItem('user');
  window.location.href = "../login/login.html";
};

window.showSection = async function(section) {
  window.currentSection = section;
  updateActiveNav(section);
  currentData = await dataController.loadSection(section);
};

window.showStudents = () => window.showSection('students');
window.showRoutes = () => window.showSection('routes');
window.showBuses = () => window.showSection('buses');
window.showDrivers = () => window.showSection('drivers');
window.showMaintenanceLogs = () => window.showSection('maintenance');
window.showIncidents = () => window.showSection('incidents');

function updateActiveNav(section) {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });
  const titles = {
    students: "Students Management", routes: "Route Management",
    buses: "Bus Fleet", drivers: "Driver Roster",
    maintenance: "Maintenance Logs", incidents: "Incident Reports"
  };
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) pageTitle.textContent = titles[section] || "Dashboard";
}

window.sortTable = function(key) {
  if (lastSortKey === key) sortDirection *= -1;
  else { sortDirection = 1; lastSortKey = key; }
  currentData = tableController.sort(currentData, key, sortDirection);
  tableController.renderTable(currentData, dataController.sections[window.currentSection].columns, dataController.sections[window.currentSection].actions);
};

window.searchData = function() {
  const term = document.getElementById("search-input").value.toLowerCase();
  const filtered = currentData.filter(item => 
    Object.values(item).some(val => val && val.toString().toLowerCase().includes(term))
  );
  tableController.renderTable(filtered, dataController.sections[window.currentSection].columns, dataController.sections[window.currentSection].actions);
};

window.openAddForm = async function(section) {
  // Use passed section or standard application state
  const targetSection = (typeof section === 'string') ? section : window.currentSection;
  
  try {
    const routes = await apiClient.fetch('routes');
    const buses = await apiClient.fetch('buses');
    formController.openAddForm(targetSection, routes, buses);
  } catch (err) {
    console.error("Failed to open add form:", err);
    uiUtils.showToast("Could not load form requirements", "error");
  }
};

window.closeForm = () => formController.closeForm();

window.saveData = async function(section) {
  const form = document.getElementById("data-form");
  const data = Object.fromEntries(new FormData(form).entries());
  
  try {
    await apiClient.post(`add${section}`, data);
    uiUtils.showToast("Added successfully!", "success");
    window.closeForm();
    window.showSection(section);
    loadDashboardStats();
  } catch (err) {
    uiUtils.showToast(err.message, "error");
  }
};

window.deleteItem = async function(section, id) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  });

  if (!result.isConfirmed) return;

  uiUtils.showLoading();
  try {
    // API Unified Endpoint: /api/delete/:table/:id
    await apiClient.delete(`delete/${section}/${id}`);
    uiUtils.showToast("Deleted successfully", "success");
    window.showSection(section);
    loadDashboardStats();
  } catch (err) {
    uiUtils.showToast(err.message, "error");
  } finally {
    uiUtils.hideLoading();
  }
};

window.onclick = (e) => {
  const modal = document.getElementById("add-form");
  if (e.target === modal) modal.style.display = "none";
};

