/**
 * Data Controller for handling section-specific logic
 */

import { apiClient } from './apiClient.js';
import { uiUtils } from './uiUtils.js';
import { tableController } from './tableController.js';

export const dataController = {
  sections: {
    students: {
      endpoint: 'students',
      columns: [
        { key: "StudentID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "Name", label: "Name" },
        { key: "Grade", label: "Grade" },
        { key: "BusRouteID", label: "Route ID" },
        { key: "BoardingPoint", label: "Boarding Point" }
      ]
    },
    routes: {
      endpoint: 'routes',
      columns: [
        { key: "RouteID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "StartPoint", label: "Start" },
        { key: "EndPoint", label: "End" },
        { key: "Distance", label: "Distance (km)" }
      ]
    },
    buses: {
      endpoint: 'buses',
      columns: [
        { key: "BusID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "BusNumber", label: "Bus No." },
        { key: "Capacity", label: "Capacity" },
        { key: "RouteID", label: "Route" }
      ]
    },
    drivers: {
      endpoint: 'drivers',
      columns: [
        { key: "DriverID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "Name", label: "Name" },
        { key: "LicenseNumber", label: "License" },
        { key: "Phone", label: "Phone" }
      ]
    },
    maintenance: {
      endpoint: 'maintenance',
      columns: [
        { key: "LogID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "BusID", label: "Bus ID" },
        { key: "Date", label: "Date" },
        { key: "Description", label: "Description" }
      ]
    },
    incidents: {
      endpoint: 'incidents',
      columns: [
        { key: "IncidentID", label: "ID", formatter: (val) => `<span class="badge-id">${val}</span>` },
        { key: "BusID", label: "Bus ID" },
        { key: "Date", label: "Date" },
        { key: "Description", label: "Description" }
      ]
    }
  },

  async loadSection(sectionName) {
    const section = this.sections[sectionName];
    if (!section) return;

    uiUtils.showLoading();
    try {
      const data = await apiClient.fetch(section.endpoint);
      tableController.renderTable(data, section.columns);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error loading data";
      console.error(`Failed to load ${sectionName}:`, err);
      uiUtils.showToast(errorMsg, "error");
      return [];
    } finally {
      uiUtils.hideLoading();
    }
  }
};
