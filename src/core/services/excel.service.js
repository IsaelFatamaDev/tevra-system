export const excelService = {
    exportToCSV: (title, headers, data, summaryRow = null) => {
    
    let csvContent = `"${title}"\n`;
    csvContent += `"Fecha de generación: ${new Date().toLocaleString()}"\n\n`;

    
    csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

    
    data.forEach(row => {
      csvContent += row.map(cell => {
        let cellContent = cell === null || cell === undefined ? '' : String(cell);
        // Si el contenido parece un número con coma o empieza con 0 y es numérico largo (dni/tel), forzar texto en excel (="value")
        if (cellContent.match(/^0\d{6,}/)) {
          return `="""${cellContent}"""`;
        }
        return `"${cellContent.replace(/"/g, '""')}"`;
      }).join(',') + '\n';
    });

    // Fila de sumario/totales
    if (summaryRow) {
      csvContent += '\n' + summaryRow.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',') + '\n';
    }

    // Agregar BOM para UTF-8 (Excel lo necesita para los acentos)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = title.endsWith('.xlsx') || title.endsWith('.csv') 
      ? title 
      : `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Descarga la plantilla maestra de Dashboard y la llena con datos dinámicos usando exceljs
   * @param {Object} data Objeto con arreglos para cada hoja, ej: { comisiones: [...], ventas: [...] }
   */
  exportTemplate: async (dataToFill) => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      
      // Fetch la plantilla estática
      const response = await fetch('/TeVra_Dashboard_Pro_Export.xlsx');
      if (!response.ok) throw new Error("Template no encontrado");
      const arrayBuffer = await response.arrayBuffer();

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(arrayBuffer);

      
      if (dataToFill.comisiones) {
        const wsComisiones = wb.getWorksheet('Comisiones Detalladas');
        if (wsComisiones) {
          
          dataToFill.comisiones.forEach((row, i) => {
            const rowIndex = i + 2;
            const wsRow = wsComisiones.getRow(rowIndex);
            
            wsRow.getCell(2).value = row[0]; 
            wsRow.getCell(3).value = Number(row[1]) || 0; 
            wsRow.getCell(4).value = Number(row[2]) || 0; 
            wsRow.getCell(5).value = Number(row[3]) || 0; 
            wsRow.getCell(6).value = Number(row[4]) || 0; 
            wsRow.commit();
          });
        }
      }

      
      if (dataToFill.topAgents) {
        const wsAgents = wb.getWorksheet('Productividad Agentes');
        if (wsAgents) {
          dataToFill.topAgents.forEach((agent, i) => {
            const row = wsAgents.getRow(i + 2);
            row.getCell(2).value = agent.displayName;
            row.getCell(3).value = Number(agent.totalRevenue) || 0;
            row.getCell(4).value = Number(agent.totalOrders) || 0;
            row.getCell(5).value = (Number(agent.totalRevenue) || 0) / (Number(agent.totalOrders) || 1); 
            row.getCell(6).value = 0; 
            row.commit();
          });
        }
      }

      if (dataToFill.revenueByMonth) {
        const wsVentas = wb.getWorksheet('Ventas por Mes');
        if (wsVentas) {
          dataToFill.revenueByMonth.forEach((m, i) => {
            const row = wsVentas.getRow(i + 2);
            row.getCell(2).value = m.month ? new Date(m.month + '-01').toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }) : '';
            row.getCell(3).value = Number(m.revenue) || 0;
            row.getCell(4).value = Number(m.orders) || 0;
            row.getCell(5).value = (Number(m.revenue) || 0) / (Number(m.orders) || 1);
            row.commit();
          });
        }
      }

      if (dataToFill.categories) {
        const wsCat = wb.getWorksheet('Rend. por Categoría');
        if (wsCat) {
          dataToFill.categories.forEach((c, i) => {
            const row = wsCat.getRow(i + 2);
            row.getCell(2).value = c.category || 'Sin Categoría';
            row.getCell(3).value = Number(c.totalRevenue) || 0;
            row.getCell(4).value = Number(c.totalCost) || (Number(c.totalRevenue) * 0.7); 
            row.getCell(5).value = (Number(c.totalRevenue) || 0) - (Number(c.totalCost) || (Number(c.totalRevenue) * 0.7)); 
            row.getCell(6).value = ((row.getCell(5).value / (row.getCell(3).value || 1)) * 100).toFixed(2) + '%';
            row.commit();
          });
        }
      }

      
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `TeVra_Dashboard_Pro_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error exporting template:", err);
      alert("Error exportando la plantilla de excel. Verifique la consola.");
    }
  }
};

export default excelService;
