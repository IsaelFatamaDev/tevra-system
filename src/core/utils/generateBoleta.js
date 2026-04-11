import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const NAVY    = [15,  36,  64]
const CORAL   = [255, 107, 107]
const NAVY_LT = [123, 168, 212]
const LIGHT   = [249, 250, 252]
const GRAY    = [122, 133, 153]
const DARK    = [26,  34,  50]
const WHITE   = [255, 255, 255]
const BORDER  = [226, 230, 239]

const usd = (n) => `$${Number(n || 0).toFixed(2)}`

const resolveAddr = (addr) => {
  if (!addr) return null
  if (typeof addr === 'object')
    return [addr.street, addr.district, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ')
  return String(addr)
}

// Función de render reutilizable. finalH=null en la pasada de prueba.
function renderInvoice(doc, order, finalH) {
  const W   = 148
  const pad = 10

  const orderNum  = String(order.orderNumber || (order.id ? order.id.slice(0, 8) : '000000'))
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const clientName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer'
  const agentName  = `${order.agent?.firstName  || ''} ${order.agent?.lastName  || ''}`.trim()
  const addrStr    = resolveAddr(order.shippingAddress) || resolveAddr(order.customer?.address)

  // ── HEADER ────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 44, 'F')

  doc.setFillColor(...CORAL)
  doc.rect(0, 44, W * 0.6, 2.5, 'F')
  doc.setFillColor(255, 154, 107)
  doc.rect(W * 0.6, 44, W * 0.4, 2.5, 'F')

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('Te', pad, 20)
  const teW = doc.getTextWidth('Te')
  doc.setTextColor(...CORAL)
  doc.text('Vra', pad + teW, 20)

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY_LT)
  doc.text('tevra.com  ·  support@tevra.com', pad, 27)
  doc.text('TeVra LLC  ·  California, USA',    pad, 32)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('INVOICE', W - pad, 16, { align: 'right' })

  const labelX = W - pad - 46
  const valueX = W - pad

  const metaRow = (label, value, yPos) => {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...NAVY_LT)
    doc.text(label, labelX, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text(value, valueX, yPos, { align: 'right' })
  }

  metaRow('Invoice No', `#${orderNum}`, 24)
  metaRow('Issue Date', orderDate,       29)

  const statusLabel = order.status ? order.status.replace(/_/g, ' ').toUpperCase() : 'PENDING'
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  const sW = doc.getTextWidth(statusLabel)
  const bW = sW + 8
  doc.setFillColor(...CORAL)
  doc.roundedRect(valueX - bW, 31.5, bW, 5.5, 1.5, 1.5, 'F')
  doc.setTextColor(...WHITE)
  doc.text(statusLabel, valueX - bW / 2, 35.2, { align: 'center' })

  let y = 52

  // ── CARDS ─────────────────────────────────────────────────────
  const colW = (W - pad * 2 - 4) / 2

  const drawInfoCard = (x, title, name, line2, line3) => {
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, y, colW, 32, 2, 2, 'S')

    doc.setFillColor(...NAVY)
    doc.roundedRect(x, y, colW, 7, 2, 2, 'F')
    doc.rect(x, y + 4, colW, 3, 'F')

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY_LT)
    doc.text(title, x + 3.5, y + 5)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(name, x + 3.5, y + 14)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    if (line2) doc.text(line2, x + 3.5, y + 20)
    if (line3) doc.text(line3, x + 3.5, y + 26)
  }

  drawInfoCard(
    pad, 'BILL TO', clientName,
    order.customer?.email || '',
    addrStr ? doc.splitTextToSize(addrStr, colW - 7)[0] : ''
  )
  drawInfoCard(
    pad + colW + 4, 'SALES AGENT',
    agentName || 'Direct Sale',
    order.agent?.referralCode ? `Code: ${order.agent.referralCode}` : '',
    order.agent?.email || ''
  )

  y += 38

  // ── ITEMS TABLE ───────────────────────────────────────────────
  const items = (order.items || []).map((item, i) => [
    String(i + 1),
    String(item.productName || 'Product'),
    item.variantInfo?.color || item.variantInfo?.size || '—',
    String(item.quantity || 1),
    usd(item.unitPrice),
    usd(item.totalPrice ?? (item.unitPrice * item.quantity)),
  ])

  autoTable(doc, {
    startY: y,
    head: [['#', 'Description', 'Variant', 'Qty', 'Unit Price', 'Amount']],
    body: items.length > 0 ? items : [['1', 'No items detailed', '—', '—', '—', usd(order.total)]],
    theme: 'plain',
    headStyles: {
      fillColor: NAVY,
      textColor: NAVY_LT,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      valign: 'middle',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      textColor: DARK,
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', textColor: GRAY },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 18, halign: 'center', textColor: GRAY },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: pad, right: pad },
    tableWidth: W - pad * 2,
    didParseCell: (data) => {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.2 }
        data.cell.styles.lineColor = BORDER
      }
    },
  })

  y = doc.lastAutoTable.finalY + 6

  // ── TOTALS ────────────────────────────────────────────────────
  const totW = 68
  const tx   = W - pad - totW

  const tLine = (label, value, valueColor = GRAY) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(label, tx + 4, y)
    doc.setTextColor(...valueColor)
    doc.text(value, tx + totW - 4, y, { align: 'right' })
    y += 5.5
  }

  y += 2
  tLine('Subtotal:', usd(order.subtotal))
  tLine('Shipping & Handling:', usd(order.shippingCost))
  if (order.discount > 0) tLine('Discount:', `-${usd(order.discount)}`, [220, 60, 60])

  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.3)
  doc.line(tx + 4, y, tx + totW - 4, y)
  y += 5

  doc.setFillColor(...NAVY)
  doc.roundedRect(tx, y - 2, totW, 11, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('TOTAL DUE', tx + 5, y + 5)
  doc.setFontSize(11)
  doc.setTextColor(...CORAL)
  doc.text(usd(order.total), tx + totW - 5, y + 5.5, { align: 'right' })
  y += 16

  if (order.agentCommission > 0) {
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(0, 190, 130)
    doc.text(`Agent commission: ${usd(order.agentCommission)}`, tx, y)
    y += 5
  }

  // ── ORDER NOTES ───────────────────────────────────────────────
  if (order.notes) {
    y += 2
    doc.setFillColor(255, 251, 235)
    doc.setDrawColor(240, 190, 80)
    doc.setLineWidth(0.3)
    doc.roundedRect(pad, y, W - pad * 2, 16, 2, 2, 'FD')
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(160, 110, 0)
    doc.text('ORDER NOTES', pad + 3.5, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 70, 0)
    const lines = doc.splitTextToSize(order.notes, W - pad * 2 - 7)
    doc.text(lines, pad + 3.5, y + 11)
    y += 20
  }

  // ── FOOTER ────────────────────────────────────────────────────
  y += 4
  // En la pasada final, el footer arranca exacto al final de la página
  const footerY = finalH != null ? finalH - 24 : y

  doc.setFillColor(...NAVY)
  doc.rect(0, footerY, W, 24, 'F')

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('Thank you for your business!', W / 2, footerY + 8, { align: 'center' })

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY_LT)
  doc.text(
    'TeVra LLC  ·  California, USA  ·  tevra.com  ·  support@tevra.com',
    W / 2, footerY + 14, { align: 'center' }
  )
  doc.setTextColor(70, 100, 130)
  doc.text(
    `Generated: ${new Date().toLocaleString('en-US')}  ·  This document is not a tax receipt.`,
    W / 2, footerY + 19, { align: 'center' }
  )

  return { orderNum, contentEndY: y }
}

export default async function generateInvoice(order, tenantInfo = {}) {
  const W        = 148
  const FOOTER_H = 24
  const MARGIN   = 4

  // Pasada 1: medir el contenido con altura provisional grande
  const probe = new jsPDF({ unit: 'mm', format: [W, 400], orientation: 'portrait' })
  const { orderNum, contentEndY } = renderInvoice(probe, order, null)

  // Calcular altura exacta: contenido + margen + footer, sin espacio sobrante
  const exactH = contentEndY + MARGIN + FOOTER_H

  // Pasada 2: generar el PDF con la altura perfecta
  const doc = new jsPDF({ unit: 'mm', format: [W, exactH], orientation: 'portrait' })
  renderInvoice(doc, order, exactH)

  doc.save(`invoice-${orderNum}.pdf`)
}