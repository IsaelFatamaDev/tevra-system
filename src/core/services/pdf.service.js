import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuración de colores corporativos de TeVra
const colors = {
  primary: [19, 64, 116], // #134074
  secondary: [13, 49, 92], // #0d315c
  accent: [165, 192, 216], // #a5c0d8
  background: [238, 244, 237], // #eef4ed
  text: [51, 51, 51],
};

import api from './api';

export const pdfService = {
  /**
   * Genera un recibo/boleta en PDF
   */
  generateInvoicePDF: async (invoice) => {
    const doc = new jsPDF();
    
    // Fetch tenant config to get logo
    let logoUrl = null;
    let tenantName = 'TeVra';
    try {
      const configRes = await api.get('/tenants/public-config/' + (invoice.tenantId || ''));
      if (configRes && configRes.logoUrl) logoUrl = configRes.logoUrl;
      if (configRes && configRes.name) tenantName = configRes.name;
    } catch (e) {
      console.warn("Could not fetch tenant config for PDF logo");
    }

    // Header background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo / Title
    if (logoUrl) {
      try {
        // Create an Image element to load the logo
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = logoUrl;
        });
        
        // Calculate dimensions to fit in max 40x20
        const maxWidth = 40;
        const maxHeight = 20;
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        if (h > maxHeight) {
          w = Math.round((w * maxHeight) / h);
          h = maxHeight;
        }
        // Center vertically in header
        const yPos = 20 - (h / 2);
        doc.addImage(img, 'PNG', 14, yPos, w, h);
      } catch (e) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(tenantName, 14, 25);
      }
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(tenantName, 14, 25);
    }
    
    // Invoice details (Right aligned in header)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`BOLETA: ${invoice.invoiceNumber}`, 196, 20, { align: 'right' });
    doc.text(`FECHA: ${new Date(invoice.createdAt).toLocaleDateString()}`, 196, 26, { align: 'right' });

    // Customer Info
    doc.setTextColor(...colors.text);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Cliente:', 14, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${invoice.customerName}`, 14, 62);
    if (invoice.documentNumber) doc.text(`Documento: ${invoice.documentNumber}`, 14, 68);
    if (invoice.address) doc.text(`Dirección: ${invoice.address}`, 14, 74);

    // Items Table
    const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);
    const tableData = items.map(item => [
      item.name,
      item.quantity.toString(),
      `S/ ${Number(item.unitPrice).toFixed(2)}`,
      `S/ ${Number(item.subtotal).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 85,
      head: [['Descripción', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL A PAGAR: S/ ${Number(invoice.totalAmount).toFixed(2)}`, 196, finalY, { align: 'right' });

    // Footer
    if (invoice.notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Notas adicionales:', 14, finalY + 15);
      doc.text(invoice.notes, 14, finalY + 20, { maxWidth: 180 });
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Gracias por su preferencia - TeVra LLC', 105, 280, { align: 'center' });

    // Download
    doc.save(`boleta_${invoice.invoiceNumber}.pdf`);
  },

  /**
   * Genera un reporte tabular (e.g. Órdenes)
   */
  generateReportPDF: (title, columns, data, filename) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`TeVra - ${title}`, 14, 20);

    // Date
    doc.setTextColor(...colors.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte generado el: ${new Date().toLocaleString()}`, 14, 40);

    // Table
    doc.autoTable({
      startY: 45,
      head: [columns],
      body: data,
      theme: 'striped',
      headStyles: {
        fillColor: colors.secondary,
      },
      styles: {
        fontSize: 9,
      },
    });

    doc.save(`${filename}.pdf`);
  },

  /**
   * Genera un reporte de Dashboard completo (Métricas y Múltiples Tablas)
   */
  generateDashboardReportPDF: async (tenantId, period, stats, topAgents, cities, t) => {
    const doc = new jsPDF();
    
    // Fetch tenant config to get logo
    let logoUrl = null;
    let tenantName = 'TeVra';
    try {
      const configRes = await api.get('/tenants/public-config/' + (tenantId || ''));
      if (configRes && configRes.logoUrl) logoUrl = configRes.logoUrl;
      if (configRes && configRes.name) tenantName = configRes.name;
    } catch (e) {
      console.warn("Could not fetch tenant config for PDF logo");
    }

    // Header Background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Logo / Title
    if (logoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve; img.onerror = reject; img.src = logoUrl;
        });
        const maxWidth = 30; const maxHeight = 15;
        let w = img.width; let h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        if (h > maxHeight) { w = Math.round((w * maxHeight) / h); h = maxHeight; }
        const yPos = 17.5 - (h / 2);
        doc.addImage(img, 'PNG', 14, yPos, w, h);
      } catch (e) {
        doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
        doc.text(tenantName, 14, 23);
      }
    } else {
      doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
      doc.text(tenantName, 14, 23);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('Reporte de Rendimiento', 196, 20, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${period} | Generado: ${new Date().toLocaleDateString()}`, 196, 26, { align: 'right' });

    // Global Metrics Section
    doc.setTextColor(...colors.primary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas Globales', 14, 50);

    const metricsData = [
      ['Total Pedidos', String(stats?.totalOrders || 0)],
      ['Ingresos Totales', `S/ ${Number(stats?.totalRevenue || 0).toFixed(2)}`],
      ['Comisión Total', `S/ ${Number(stats?.totalTevraCommission || 0).toFixed(2)}`],
      ['Agentes Activos', String(stats?.totalAgents || 0)],
      ['Clientes Activos', String(stats?.totalCustomers || 0)]
    ];

    doc.autoTable({
      startY: 55,
      body: metricsData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 245, 249], textColor: colors.primary, cellWidth: 100 },
        1: { halign: 'right', fontStyle: 'bold', textColor: [51, 51, 51] }
      }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // Top Agents Table
    if (topAgents && topAgents.length > 0) {
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Mejores Agentes', 14, currentY);

      const agentRows = topAgents.map(a => [
        a.displayName, 
        a.totalOrders, 
        `S/ ${Number(a.totalRevenue || 0).toFixed(2)}`
      ]);

      doc.autoTable({
        startY: currentY + 5,
        head: [['Agente', 'Pedidos', 'Ingresos']],
        body: agentRows,
        theme: 'striped',
        headStyles: { fillColor: colors.secondary, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' } }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Top Cities Table
    if (cities && cities.length > 0) {
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Rendimiento por Ciudad', 14, currentY);

      const cityRows = cities.map(c => [
        c.city || 'Sin Ciudad', 
        c.totalOrders
      ]);

      doc.autoTable({
        startY: currentY + 5,
        head: [['Ciudad / Ubicación', 'Pedidos Registrados']],
        body: cityRows,
        theme: 'striped',
        headStyles: { fillColor: colors.secondary, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: { 1: { halign: 'center' } }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Reporte Oficial TeVra - Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`reporte-tevra-${period}.pdf`);
  }
};

export default pdfService;
