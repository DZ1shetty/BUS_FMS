/**
 * Table Controller for rendering and managing data tables
 */

export const tableController = {
  renderTable(data, columns) {
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

    contentDiv.innerHTML = `
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              ${columns.map(col => `
                <th onclick="window.sortTable('${col.key}')">
                  ${col.label} <i class="fas fa-sort"></i>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr class="hover-row">
                ${columns.map(col => {
                  let val = item[col.key];
                  
                  // Use formatter if defined
                  if (col.formatter) {
                    return `<td>${col.formatter(val)}</td>`;
                  }

                  const displayVal = val !== undefined && val !== null ? val : '-';
                  
                  // Default ID Styling
                  if (col.key.toLowerCase().includes('id') && !col.formatter) {
                    return `<td><span class="badge-id">${displayVal}</span></td>`;
                  }
                  
                  // Status Coloring Logic
                  const lowerVal = displayVal.toString().toLowerCase();
                  if (['active', 'completed', 'resolved', 'healthy'].includes(lowerVal)) {
                     return `<td><span class="status-badge status-green">${displayVal}</span></td>`;
                  }
                  if (['pending', 'maintenance', 'warning', 'repair'].includes(lowerVal)) {
                     return `<td><span class="status-badge status-orange">${displayVal}</span></td>`;
                  }
                  if (['inactive', 'cancelled', 'incident', 'emergency', 'danger'].includes(lowerVal)) {
                     return `<td><span class="status-badge status-red">${displayVal}</span></td>`;
                  }
                  
                  return `<td>${displayVal}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  sort(data, key, direction) {
    return [...data].sort((a, b) => {
      const valA = a[key] ? a[key].toString().toLowerCase() : "";
      const valB = b[key] ? b[key].toString().toLowerCase() : "";
      return valA < valB ? -direction : valA > valB ? direction : 0;
    });
  }
};
