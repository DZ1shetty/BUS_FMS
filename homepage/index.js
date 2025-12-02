let currentSection = "students";
let currentData = [];
let currentColumns = [];
let currentActions = null;
let sortDirection = 1;
let lastSortKey = "";
let incidentsChart = null;
let distributionChart = null;

// Initialize
window.addEventListener("DOMContentLoaded", () => {
  // User Info
  const username = localStorage.getItem("username") || "User";
  document.getElementById("logged-in-as").textContent = username;

  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  
  // Check saved theme
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Sidebar Toggle (Desktop)
  const sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar");
      sidebar.classList.toggle("collapsed");
    });
  }

  // Initial Load
  loadDashboardStats();
  initCharts();
  showStudents();
});

// Dashboard Stats
async function loadDashboardStats() {
  try {
    // Add timestamp to prevent caching
    const response = await fetch(`http://localhost:5000/api/dashboard-stats?t=${new Date().getTime()}`);
    if (response.ok) {
      const stats = await response.json();
      document.getElementById('stat-students').textContent = stats.students || 0;
      document.getElementById('stat-buses').textContent = stats.buses || 0;
      document.getElementById('stat-routes').textContent = stats.routes || 0;
      document.getElementById('stat-incidents').textContent = stats.incidents || 0;
    }
  } catch (error) {
    console.error("Failed to load stats", error);
  }
}

// Force Update Stats
function forceUpdateStats() {
  // Single delayed update is more efficient than multiple immediate ones
  setTimeout(() => {
    loadDashboardStats();
    updateCharts();
  }, 300);
}

// Search Logic
let searchTimeout;
window.searchData = function() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const term = document.getElementById("search-input").value.toLowerCase();
    
    if (!term) {
      if (currentData.length > 0) {
          const funcName = `show${currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}`;
          if (window[funcName]) window[funcName]();
      }
      return;
    }

    const filtered = currentData.filter(item => {
      return Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(term)
      );
    });

    renderTable(filtered, currentColumns, currentActions);
  }, 300); // Debounce 300ms
};
async function initCharts() {
  const ctx1 = document.getElementById('incidentsChart').getContext('2d');
  const ctx2 = document.getElementById('distributionChart').getContext('2d');

  // Create Gradient for Line Chart
  const gradient = ctx1.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(255, 0, 85, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 0, 85, 0)');

  // Common options for neon look
  Chart.defaults.color = '#888';
  Chart.defaults.borderColor = '#222';
  Chart.defaults.font.family = "'Rajdhani', sans-serif";

  incidentsChart = new Chart(ctx1, {
      type: 'line',
      data: {
          labels: [],
          datasets: [{
              label: 'Incidents',
              data: [],
              borderColor: '#ff0055',
              backgroundColor: gradient,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: '#000',
              pointBorderColor: '#ff0055',
              pointHoverBackgroundColor: '#ff0055',
              pointHoverBorderColor: '#fff',
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
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: '#ff0055',
                  borderWidth: 1,
                  displayColors: false,
                  padding: 10
              }
          },
          scales: {
              y: { 
                  beginAtZero: true, 
                  grid: { color: '#1a1a1a' },
                  ticks: { stepSize: 1 }
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
              backgroundColor: ['#00f3ff', '#00ff9d', '#7000ff'],
              borderColor: '#080808',
              borderWidth: 4,
              hoverOffset: 10
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: { 
                  position: 'right', 
                  labels: { 
                      padding: 20, 
                      usePointStyle: true,
                      font: { size: 12 }
                  } 
              }
          },
          cutout: '75%'
      }
  });

  updateCharts();
}

async function updateCharts() {
  try {
      // Fetch Stats for Distribution
      const statsRes = await fetch(`http://localhost:5000/api/dashboard-stats?t=${Date.now()}`);
      const stats = await statsRes.json();
      
      if (distributionChart) {
          distributionChart.data.datasets[0].data = [stats.students, stats.buses, stats.routes];
          distributionChart.update();
      }

      // Fetch Incidents for Timeline
      const incRes = await fetch(`http://localhost:5000/api/incidents?t=${Date.now()}`);
      const incidents = await incRes.json();
      
      // Process incidents by date (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
      }).reverse();

      const counts = last7Days.map(date => 
          incidents.filter(i => {
            if (!i.Date) return false;
            // Handle both string and Date object
            const incDate = new Date(i.Date).toISOString().split('T')[0];
            return incDate === date;
          }).length
      );

      if (incidentsChart) {
          incidentsChart.data.labels = last7Days.map(d => d.slice(5)); // MM-DD
          incidentsChart.data.datasets[0].data = counts;
          incidentsChart.update();
      }

  } catch (e) {
      console.error("Chart update failed", e);
  }
}

// Theme Logic
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function updateActiveNav(section) {
  currentSection = section;
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.section === section) btn.classList.add("active");
  });
  
  // Update Page Title
  const titles = {
    students: "Students Management",
    routes: "Route Management",
    buses: "Bus Fleet",
    drivers: "Driver Roster",
    maintenance: "Maintenance Logs",
    incidents: "Incident Reports"
  };
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) pageTitle.textContent = titles[section] || "Dashboard";
}

// Generic Table Renderer
function renderTable(data, columns, actionsCallback) {
  const contentDiv = document.getElementById("content");
  if (!contentDiv) return;
  
  if (!data || data.length === 0) {
    contentDiv.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No records found.</p>
      </div>`;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            ${columns.map(col => `
              <th onclick="sortTable('${col.key}')">
                ${col.label} <i class="fas fa-sort"></i>
              </th>
            `).join('')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((item, index) => `
            <tr>
              ${columns.map(col => `<td>${item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : '-'}</td>`).join('')}
              <td>
                ${actionsCallback(item)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  contentDiv.innerHTML = html;
}

// Sorting Logic
window.sortTable = function(key) {
  if (lastSortKey === key) {
    sortDirection *= -1;
  } else {
    sortDirection = 1;
    lastSortKey = key;
  }

  currentData.sort((a, b) => {
    const valA = a[key] ? a[key].toString().toLowerCase() : "";
    const valB = b[key] ? b[key].toString().toLowerCase() : "";
    
    if (valA < valB) return -1 * sortDirection;
    if (valA > valB) return 1 * sortDirection;
    return 0;
  });

  renderTable(currentData, currentColumns, currentActions);
};

// Search Logic - Removed old implementation
// window.searchData = function() { ... }

// Section Functions
async function fetchData(endpoint) {
  showLoading();
  try {
    const response = await fetch(`http://localhost:5000/api/${endpoint}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    showToast("Error loading data", "error");
    return [];
  } finally {
    hideLoading();
  }
}

window.showStudents = async function() {
  updateActiveNav("students");
  const data = await fetchData("students");
  currentData = data;
  currentColumns = [
    { key: "StudentID", label: "ID" },
    { key: "Name", label: "Name" },
    { key: "Grade", label: "Grade" },
    { key: "BusRouteID", label: "Route ID" },
    { key: "BoardingPoint", label: "Boarding Point" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteStudentData('${item.StudentID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

window.showRoutes = async function() {
  updateActiveNav("routes");
  const data = await fetchData("routes");
  currentData = data;
  currentColumns = [
    { key: "RouteID", label: "ID" },
    { key: "StartPoint", label: "Start" },
    { key: "EndPoint", label: "End" },
    { key: "Distance", label: "Distance (km)" },
    { key: "EstimatedTime", label: "Est. Time" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteRoutesData('${item.RouteID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

window.showBuses = async function() {
  updateActiveNav("buses");
  const data = await fetchData("buses");
  currentData = data;
  currentColumns = [
    { key: "BusID", label: "ID" },
    { key: "BusNumber", label: "Bus No." },
    { key: "Capacity", label: "Capacity" },
    { key: "RouteID", label: "Route" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteBusData('${item.BusID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

window.showDrivers = async function() {
  updateActiveNav("drivers");
  const data = await fetchData("drivers");
  currentData = data;
  currentColumns = [
    { key: "DriverID", label: "ID" },
    { key: "Name", label: "Name" },
    { key: "LicenseNumber", label: "License" },
    { key: "Phone", label: "Phone" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteDriverData('${item.DriverID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

window.showMaintenanceLogs = async function() {
  updateActiveNav("maintenance");
  const data = await fetchData("maintenance");
  currentData = data;
  currentColumns = [
    { key: "LogID", label: "ID" },
    { key: "BusID", label: "Bus ID" },
    { key: "Date", label: "Date" },
    { key: "Description", label: "Description" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteMaintainenceData('${item.LogID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

window.showIncidents = async function() {
  updateActiveNav("incidents");
  const data = await fetchData("incidents");
  currentData = data;
  currentColumns = [
    { key: "IncidentID", label: "ID" },
    { key: "BusID", label: "Bus ID" },
    { key: "Date", label: "Date" },
    { key: "Description", label: "Description" }
  ];
  currentActions = (item) => `
    <button class="action-btn btn-delete" onclick="deleteIncidentData('${item.IncidentID}')">
      <i class="fas fa-trash"></i> Delete
    </button>
  `;
  renderTable(data, currentColumns, currentActions);
};

// Form & Action Logic
window.openAddForm = function(section) {
  currentSection = section;
  const formTitle = document.getElementById("form-title");
  const form = document.getElementById("data-form");
  const addForm = document.getElementById("add-form");
  
  if (!formTitle || !form || !addForm) return;

  formTitle.textContent = `Add New ${section.slice(0, -1)}`; // Remove 's' roughly
  addForm.style.display = "flex"; // Flex for centering
  form.innerHTML = "";

  const fields = {
    students: ["Name", "Grade", "Bus Route ID", "Boarding Point"],
    routes: ["Start Point", "End Point", "Distance"],
    buses: ["Bus Number", "Capacity", "Route ID"],
    drivers: ["Name", "License Number", "Phone"],
    maintenance: ["Bus ID", "Date", "Description"],
    incidents: ["Bus ID", "Date", "Description"]
  };

  (fields[section] || []).forEach(field => {
    const div = document.createElement("div");
    div.className = "form-group";
    
    const label = document.createElement("label");
    label.textContent = field;
    
    const input = document.createElement("input");
    input.name = field.replace(/\s+/g, ""); // Remove spaces for name
    input.placeholder = `Enter ${field}`;
    
    if (field.includes("Date")) input.type = "date";
    else if (field.includes("ID") || field.includes("Capacity") || field.includes("Distance")) input.type = "number";
    else input.type = "text";
    
    input.required = true;
    
    div.appendChild(label);
    div.appendChild(input);
    form.appendChild(div);
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    saveData(section);
  };
};

window.closeForm = function() {
  const addForm = document.getElementById("add-form");
  if (addForm) addForm.style.display = "none";
};

async function saveData(section) {
  const form = document.getElementById("data-form");
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
      if (key === 'BusRouteID') data.BusRouteID = value;
      else if (key === 'BoardingPoint') data.BoardingPoint = value;
      else if (key === 'StartPoint') data.StartPoint = value;
      else if (key === 'EndPoint') data.EndPoint = value;
      else if (key === 'BusNumber') data.BusNumber = value;
      else if (key === 'LicenseNumber') data.LicenseNumber = value;
      else data[key] = value; 
  }

  try {
    const response = await fetch(`http://localhost:5000/api/add${section}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const resData = await response.json();
    
    if (response.ok) {
      showToast("Added successfully!", "success");
      closeForm();
      
      // Refresh current view
      const refreshMap = {
        students: showStudents,
        routes: showRoutes,
        buses: showBuses,
        drivers: showDrivers,
        maintenance: showMaintenanceLogs,
        incidents: showIncidents
      };
      
      if (refreshMap[section]) {
        refreshMap[section]();
      } else {
        // Fallback
        const funcName = `show${section.charAt(0).toUpperCase() + section.slice(1)}`;
        if (window[funcName]) window[funcName]();
      }

      // Refresh stats forcefully
      forceUpdateStats();
    } else {
      showToast(resData.error || "Failed to add", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Server error", "error");
  }
}

// Delete Functions
window.deleteStudentData = async (id) => deleteItem(`deleteStudent/${id}`, showStudents);
window.deleteRoutesData = async (id) => deleteItem(`deleteRoute/${id}`, showRoutes);
window.deleteBusData = async (id) => deleteItem(`deleteBus/${id}`, showBuses);
window.deleteDriverData = async (id) => deleteItem(`deleteDriver/${id}`, showDrivers);
window.deleteMaintainenceData = async (id) => deleteItem(`deleteMaintainence/${id}`, showMaintenanceLogs);
window.deleteIncidentData = async (id) => deleteItem(`deleteIncident/${id}`, showIncidents);

async function deleteItem(endpoint, refreshCallback) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  
  showLoading();
  try {
    const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
      method: "DELETE"
    });
    
    if (response.ok) {
      showToast("Deleted successfully", "success");
      refreshCallback();
      // Refresh stats forcefully
      forceUpdateStats();
    } else {
      const data = await response.json();
      showToast(data.message || "Failed to delete", "error");
    }
  } catch (err) {
    showToast("Network error", "error");
  } finally {
    hideLoading();
  }
}

// Auth
window.logout = function() {
  localStorage.removeItem("username");
  window.location.href = "../login/login.html";
};

// Close modals on outside click
window.onclick = function(event) {
  const addForm = document.getElementById("add-form");
  if (addForm && event.target == addForm) addForm.style.display = "none";
};

// Toast & Loader
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  // Reflow
  toast.offsetHeight;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showLoading() {
  let overlay = document.querySelector('.loader-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.querySelector('.loader-overlay');
  if (overlay) overlay.classList.remove('active');
}
