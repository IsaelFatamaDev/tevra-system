/**
 * Servicio para exportar datos estructurados a CSV para abrir en Excel
 */
export const excelService = {
  /**
   * Genera un reporte en Excel/CSV
   * @param {string} title Título del reporte
   * @param {string[]} headers Array de strings con los nombres de las columnas
   * @param {Array<Array<any>>} data Filas de datos
   * @param {Array<any>} summaryRow (Opcional) Fila de totales al final
   */
  exportToCSV: (title, headers, data, summaryRow = null) => {
    // Título y fecha
    let csvContent = `"${title}"\n`;
    csvContent += `"Fecha de generación: ${new Date().toLocaleString()}"\n\n`;

    // Headers
    csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';

    // Data
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
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default excelService;
