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

export const pdfService = {
  /**
   * Genera un recibo/boleta en PDF
   */
  generateInvoicePDF: (invoice) => {
    const doc = new jsPDF();
    
    // Header background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TeVra', 14, 25);
    
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
    const tableData = invoice.items.map(item => [
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
  }
};

export default pdfService;
