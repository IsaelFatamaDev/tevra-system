import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const INK       = [18,  18,  22]
const INK_SOFT  = [90,  90,  100]
const INK_MUTED = [160, 160, 168]
const ACCENT    = [58,  90,  148]
const ACCENT_LT = [210, 220, 238]
const SURFACE   = [248, 248, 250]
const RULE      = [220, 220, 226]
const WHITE     = [255, 255, 255]
const SUCCESS   = [40,  140, 100]

const usd = (n) => `$${Number(n || 0).toFixed(2)}`

const resolveAddr = (addr) => {
  if (!addr) return null
  if (typeof addr === 'object')
    return [addr.street, addr.district, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ')
  return String(addr)
}

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

  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 40, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('Te', pad, 18)
  const teW = doc.getTextWidth('Te')
  doc.setTextColor(...ACCENT_LT)
  doc.text('Vra', pad + teW, 18)

  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...INK_MUTED)
  doc.text('tevra.com  ·  support@tevra.com', pad, 24.5)
  doc.text('TeVra LLC  ·  California, USA',    pad, 29)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('INVOICE', W - pad, 15, { align: 'right' })

  const labelX = W - pad - 46
  const valueX = W - pad

  const metaRow = (label, value, yPos) => {
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK_MUTED)
    doc.text(label, labelX, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ACCENT_LT)
    doc.text(value, valueX, yPos, { align: 'right' })
  }

  metaRow('Invoice No', `#${orderNum}`, 23)
  metaRow('Issue Date', orderDate,       28)

  const statusLabel = order.status ? order.status.replace(/_/g, ' ').toUpperCase() : 'PENDING'
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  const sW = doc.getTextWidth(statusLabel)
  const bW = sW + 7
  doc.setFillColor(...ACCENT)
  doc.roundedRect(valueX - bW, 30.5, bW, 5, 1.2, 1.2, 'F')
  doc.setTextColor(...WHITE)
  doc.text(statusLabel, valueX - bW / 2, 34, { align: 'center' })

  let y = 48

  const colW = (W - pad * 2 - 4) / 2

  const drawInfoCard = (x, title, name, line2, line3) => {
    doc.setFillColor(...SURFACE)
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.25)
    doc.roundedRect(x, y, colW, 30, 1.5, 1.5, 'FD')

    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK_MUTED)
    doc.text(title, x + 3.5, y + 5.5)

    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.2)
    doc.line(x + 3.5, y + 7.5, x + colW - 3.5, y + 7.5)

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK)
    doc.text(name, x + 3.5, y + 13.5)

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK_SOFT)
    if (line2) doc.text(line2, x + 3.5, y + 19)
    if (line3) doc.text(line3, x + 3.5, y + 24.5)
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

  y += 36

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
      fillColor: INK,
      textColor: ACCENT_LT,
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      valign: 'middle',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      textColor: INK,
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: SURFACE },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', textColor: INK_MUTED },
      1: { cellWidth: 'auto', fontStyle: 'bold' },
      2: { cellWidth: 18, halign: 'center', textColor: INK_SOFT },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: pad, right: pad },
    tableWidth: W - pad * 2,
    didParseCell: (data) => {
      if (data.section === 'body') {
        data.cell.styles.lineWidth = { bottom: 0.2 }
        data.cell.styles.lineColor = RULE
      }
    },
  })

  y = doc.lastAutoTable.finalY + 6

  const totW = 68
  const tx   = W - pad - totW

  const tLine = (label, value, valueColor = INK_SOFT) => {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK_MUTED)
    doc.text(label, tx + 4, y)
    doc.setTextColor(...valueColor)
    doc.text(value, tx + totW - 4, y, { align: 'right' })
    y += 5.5
  }

  y += 2
  tLine('Subtotal:', usd(order.subtotal))
  tLine('Shipping & Handling:', usd(order.shippingCost))
  if (order.discount > 0) tLine('Discount:', `-${usd(order.discount)}`, [200, 50, 50])

  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.25)
  doc.line(tx + 4, y, tx + totW - 4, y)
  y += 5

  doc.setFillColor(...INK)
  doc.roundedRect(tx, y - 2, totW, 11, 1.5, 1.5, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...ACCENT_LT)
  doc.text('TOTAL DUE', tx + 5, y + 5)
  doc.setFontSize(11)
  doc.setTextColor(...WHITE)
  doc.text(usd(order.total), tx + totW - 5, y + 5.5, { align: 'right' })
  y += 16

  if (order.agentCommission > 0 || order.etcFee > 0) {
    y += 2
    doc.setFillColor(...SURFACE)
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.2)
    doc.roundedRect(tx, y - 1, totW, order.etcFee > 0 ? 18 : 7, 1, 1, 'FD')

    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK_MUTED)
    doc.text('COMMISSION BREAKDOWN', tx + 4, y + 3.5)
    y += 6

    if (order.agentCommission > 0) {
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...SUCCESS)
      doc.text('Agent (12%):', tx + 4, y)
      doc.text(usd(order.agentCommission), tx + totW - 4, y, { align: 'right' })
      y += 4.5
    }
    if (order.etcFee > 0) {
      doc.setTextColor(180, 100, 20)
      doc.text('ETC Fund (3%):', tx + 4, y)
      doc.text(usd(order.etcFee), tx + totW - 4, y, { align: 'right' })
      y += 4.5
    }
    if (order.tevraProfitAmount > 0) {
      doc.setTextColor(...ACCENT)
      doc.text('TeVra (15%):', tx + 4, y)
      doc.text(usd(order.tevraProfitAmount), tx + totW - 4, y, { align: 'right' })
      y += 4.5
    }
    y += 2
  }

  if (order.notes) {
    y += 2
    doc.setFillColor(...SURFACE)
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.25)
    doc.roundedRect(pad, y, W - pad * 2, 16, 1.5, 1.5, 'FD')
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK_MUTED)
    doc.text('ORDER NOTES', pad + 3.5, y + 5.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...INK_SOFT)
    const lines = doc.splitTextToSize(order.notes, W - pad * 2 - 7)
    doc.text(lines, pad + 3.5, y + 11)
    y += 20
  }

  y += 4

  const footerY = finalH != null ? finalH - 22 : y

  doc.setFillColor(...SURFACE)
  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.25)
  doc.rect(0, footerY, W, 22, 'FD')

  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.4)
  doc.line(0, footerY, W, footerY)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...INK)
  doc.text('Thank you for your business.', W / 2, footerY + 7, { align: 'center' })

  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...INK_SOFT)
  doc.text(
    'TeVra LLC  ·  California, USA  ·  tevra.com  ·  support@tevra.com',
    W / 2, footerY + 13, { align: 'center' }
  )

  doc.setTextColor(...INK_MUTED)
  doc.text(
    `Generated: ${new Date().toLocaleString('en-US')}  ·  This document is not a tax receipt.`,
    W / 2, footerY + 18, { align: 'center' }
  )

  return { orderNum, contentEndY: y }
}

export default async function generateInvoice(order, tenantInfo = {}) {
  const W        = 148
  const FOOTER_H = 22
  const MARGIN   = 4

  const probe = new jsPDF({ unit: 'mm', format: [W, 400], orientation: 'portrait' })
  const { orderNum, contentEndY } = renderInvoice(probe, order, null)

  const exactH = contentEndY + MARGIN + FOOTER_H

  const doc = new jsPDF({ unit: 'mm', format: [W, exactH], orientation: 'portrait' })
  renderInvoice(doc, order, exactH)

  doc.save(`invoice-${orderNum}.pdf`)
}
