/**
 * Form Controller for handling Add/Delete operations
 */

import { apiClient } from './apiClient.js';
import { uiUtils } from './uiUtils.js';

export const formController = {
  async openAddForm(section, routesData = [], busesData = []) {
    const formTitle = document.getElementById("form-title");
    const form = document.getElementById("data-form");
    const addForm = document.getElementById("add-form");
    if (!formTitle || !form || !addForm) return;

    const displaySection = section || "Item";
    formTitle.textContent = `Add New ${displaySection.charAt(0).toUpperCase() + displaySection.slice(1, -1)}`;
    addForm.style.display = "flex";
    form.innerHTML = "";

    const fields = {
      students: ["Name", "Grade", "Bus Route ID", "Boarding Point"],
      routes: ["Start Point", "End Point", "Distance", "Estimated Time"],
      buses: ["Bus Number", "Capacity", "Route ID"],
      drivers: ["Name", "License Number", "Phone"],
      maintenance: ["Bus ID", "Description", "Date"],
      incidents: ["Bus ID", "Description", "Date"]
    };

    (fields[section] || []).forEach(field => {
      const div = document.createElement("div");
      div.className = "form-group";
      const label = document.createElement("label");
      label.textContent = field;
      let input;

      if (field === "Bus Route ID" || field === "Route ID") {
        input = this.createSelect(field, routesData, 'RouteID', r => `${r.RouteID}: ${r.StartPoint} - ${r.EndPoint}`);
      } else if (field === "Bus ID") {
        input = this.createSelect(field, busesData, 'BusID', b => `Bus #${b.BusNumber}`);
      } else {
        input = document.createElement("input");
        input.name = field.replace(/\s+/g, "");
        input.placeholder = `Enter ${field}`;
        input.type = field.includes("Date") ? "date" : field.includes("Distance") || field.includes("Capacity") ? "number" : "text";
      }
      
      input.required = true;
      div.appendChild(label);
      div.appendChild(input);
      form.appendChild(div);
    });

    form.onsubmit = (e) => {
      e.preventDefault();
      window.saveData(section);
    };

    // Update button text for Add mode
    const submitBtn = document.querySelector("#add-form .btn-save");
    if (submitBtn) submitBtn.textContent = `Add ${displaySection.slice(0, -1)}`;
  },

  createSelect(name, data, valueKey, labelFn) {
    const select = document.createElement("select");
    select.name = name.replace(/\s+/g, "");
    const def = document.createElement("option");
    def.value = ""; def.textContent = `Select ${name}`; def.disabled = true; def.selected = true;
    select.appendChild(def);
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item[valueKey];
      opt.textContent = labelFn(item);
      select.appendChild(opt);
    });
    return select;
  },

  closeForm() {
    const addForm = document.getElementById("add-form");
    if (addForm) addForm.style.display = "none";
  }
};
