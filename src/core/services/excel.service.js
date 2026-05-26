/**
 * TeVra Excel Report Service
 * Generates a fully styled .xlsx file from live system data using ExcelJS.
 * No static template needed — everything is built programmatically.
 */

/* ── Palette ──────────────────────────────────────────────────────── */
const COLOR = {
  navy:       '134074',
  navyDark:   '13315C',
  teal:       '8DA9C4',
  lightBlue:  'C5D8E8',
  mint:       'EEF4ED',
  white:      'FFFFFF',
  green:      '027A48',
  greenBg:    'D1FADF',
  amber:      'B45309',
  red:        'B91C1C',
  gray:       'F8FAFC',
  grayText:   '64748B',
}

/* ── Helpers ──────────────────────────────────────────────────────── */
function headerStyle(ExcelJS, { bg = COLOR.navy, color = COLOR.white, size = 10, bold = true } = {}) {
  return {
    font:      { bold, color: { argb: 'FF' + color }, size, name: 'Calibri' },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: false },
    border: {
      top:    { style: 'thin', color: { argb: 'FF' + COLOR.navyDark } },
      bottom: { style: 'thin', color: { argb: 'FF' + COLOR.navyDark } },
      left:   { style: 'thin', color: { argb: 'FF' + COLOR.navyDark } },
      right:  { style: 'thin', color: { argb: 'FF' + COLOR.navyDark } },
    },
  }
}

function cellStyle({ align = 'left', bold = false, color = COLOR.navyDark, bg = COLOR.white, size = 9 } = {}) {
  return {
    font:      { bold, color: { argb: 'FF' + color }, size, name: 'Calibri' },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bg } },
    alignment: { vertical: 'middle', horizontal: align },
    border: {
      bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
    },
  }
}

function applyRow(row, values, styles) {
  values.forEach((val, idx) => {
    const cell = row.getCell(idx + 1)
    cell.value = val
    if (styles?.[idx]) Object.assign(cell, styles[idx])
    else if (styles?.[0]) Object.assign(cell, styles[0])
  })
  row.height = 20
  row.commit()
}

function titleBlock(ws, title, subtitle, color = COLOR.navy) {
  // Row 1: Title
  ws.mergeCells('A1:H1')
  const t = ws.getCell('A1')
  t.value = title
  t.font  = { bold: true, size: 16, color: { argb: 'FF' + color }, name: 'Calibri' }
  t.alignment = { vertical: 'middle', horizontal: 'left' }
  ws.getRow(1).height = 30

  // Row 2: Subtitle + date
  ws.mergeCells('A2:F2')
  const s = ws.getCell('A2')
  s.value = subtitle
  s.font  = { size: 9, color: { argb: 'FF' + COLOR.grayText }, italic: true, name: 'Calibri' }

  ws.mergeCells('G2:H2')
  const d = ws.getCell('G2')
  d.value = `Generado: ${new Date().toLocaleString('es-PE')}`
  d.font  = { size: 8, color: { argb: 'FF' + COLOR.grayText }, name: 'Calibri' }
  d.alignment = { horizontal: 'right' }

  ws.getRow(2).height = 16
  ws.getRow(3).height = 8  // spacer
}

/* ═══════════════════════════════════════════════════════════════════ */
export const excelService = {

  /* ── Legacy CSV (kept for other uses) ──────────────────────────── */
  exportToCSV: (title, headers, data, summaryRow = null) => {
    let csv = `"${title}"\n"Fecha: ${new Date().toLocaleString()}"\n\n`
    csv += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n'
    data.forEach(row => {
      csv += row.map(cell => {
        const s = cell === null || cell === undefined ? '' : String(cell)
        if (s.match(/^0\d{6,}/)) return `="""""${s}"""""`
        return `"${s.replace(/"/g, '""')}"`
      }).join(',') + '\n'
    })
    if (summaryRow) csv += '\n' + summaryRow.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',') + '\n'
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    a.style.visibility = 'hidden'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  },

  /* ── Main: Generate full dashboard .xlsx from live data ─────────── */
  exportTemplate: async ({ stats, topAgents = [], revenueByMonth = [], categories = [], cities = [], period = '30d' }) => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator  = 'TeVra System'
      wb.company  = 'TeVra'
      wb.created  = new Date()
      wb.modified = new Date()

      const periodLabel = period === '7d' ? 'Últimos 7 días' : period === '1y' ? 'Último año' : 'Últimos 30 días'

      /* ══════════════════════════════════════════════════════════════
         SHEET 1 — Resumen General
      ══════════════════════════════════════════════════════════════ */
      {
        const ws = wb.addWorksheet('Resumen General', { properties: { tabColor: { argb: 'FF134074' } } })
        ws.columns = [
          { width: 32 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },
        ]

        titleBlock(ws, '📊 TeVra — Resumen General', `Período: ${periodLabel}`)

        // KPI block header
        const h = ws.getRow(4)
        applyRow(h,
          ['Métrica', 'Valor', 'Descripción', '', ''],
          Array(5).fill(headerStyle(ExcelJS))
        )

        const kpis = stats ? [
          ['Total de Órdenes',         stats.totalOrders ?? 0,                            'Órdenes registradas en el sistema'],
          ['Ingresos Totales (USD)',    `$${Number(stats.totalRevenue ?? 0).toFixed(2)}`,  'Suma total de ventas brutas'],
          ['Comisión TeVra (USD)',      `$${Number(stats.totalTevraCommission ?? 0).toFixed(2)}`, 'Ganancia de la plataforma'],
          ['Comisión Agentes (USD)',    `$${Number(stats.totalAgentCommission ?? 0).toFixed(2)}`, 'Pagos a agentes'],
          ['Agentes Activos',          stats.totalAgents ?? 0,                            'Agentes registrados y activos'],
          ['Clientes Registrados',     stats.totalCustomers ?? 0,                         'Usuarios clientes en la plataforma'],
          ['Órdenes Pendientes',       stats.pendingOrders ?? 0,                          'Órdenes sin confirmar'],
          ['Órdenes Entregadas',       stats.deliveredOrders ?? 0,                        'Órdenes completadas exitosamente'],
        ] : [['Sin datos', '-', 'No se pudo obtener estadísticas']]

        kpis.forEach((kpi, i) => {
          const row = ws.getRow(5 + i)
          const bg  = i % 2 === 0 ? COLOR.gray : COLOR.white
          row.getCell(1).value = kpi[0]; Object.assign(row.getCell(1), cellStyle({ bold: true, bg, color: COLOR.navy }))
          row.getCell(2).value = kpi[1]; Object.assign(row.getCell(2), cellStyle({ align: 'center', bold: true, bg, color: COLOR.navyDark }))
          row.getCell(3).value = kpi[2]; Object.assign(row.getCell(3), cellStyle({ bg, color: COLOR.grayText }))
          row.height = 22; row.commit()
        })
      }

      /* ══════════════════════════════════════════════════════════════
         SHEET 2 — Ventas por Mes
      ══════════════════════════════════════════════════════════════ */
      {
        const ws = wb.addWorksheet('Ventas por Mes', { properties: { tabColor: { argb: 'FF8DA9C4' } } })
        ws.columns = [
          { width: 6 }, { width: 18 }, { width: 20 }, { width: 14 }, { width: 18 },
        ]

        titleBlock(ws, '📈 Ventas Mensuales', `Evolución de ingresos — ${periodLabel}`)

        const h = ws.getRow(4)
        applyRow(h, ['#', 'Mes', 'Ingresos (USD)', 'Órdenes', 'Ticket Promedio (USD)'],
          Array(5).fill(headerStyle(ExcelJS))
        )

        if (revenueByMonth.length > 0) {
          const totalRev = revenueByMonth.reduce((s, m) => s + (Number(m.revenue) || 0), 0)
          const totalOrd = revenueByMonth.reduce((s, m) => s + (Number(m.orders) || 0), 0)

          revenueByMonth.forEach((m, i) => {
            const bg  = i % 2 === 0 ? COLOR.gray : COLOR.white
            const rev = Number(m.revenue) || 0
            const ord = Number(m.orders) || 0
            const avg = ord > 0 ? rev / ord : 0
            const monthLabel = m.month
              ? new Date(m.month + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
              : m.month || '—'

            const row = ws.getRow(5 + i)
            row.getCell(1).value = i + 1; Object.assign(row.getCell(1), cellStyle({ align: 'center', bg, color: COLOR.grayText }))
            row.getCell(2).value = monthLabel; Object.assign(row.getCell(2), cellStyle({ bold: true, bg, color: COLOR.navy }))
            row.getCell(3).value = rev; Object.assign(row.getCell(3), cellStyle({ align: 'right', bold: true, bg, color: COLOR.green }))
            row.getCell(3).numFmt = '"$"#,##0.00'
            row.getCell(4).value = ord; Object.assign(row.getCell(4), cellStyle({ align: 'center', bg }))
            row.getCell(5).value = avg; Object.assign(row.getCell(5), cellStyle({ align: 'right', bg, color: COLOR.grayText }))
            row.getCell(5).numFmt = '"$"#,##0.00'
            row.height = 20; row.commit()
          })

          // Totals row
          const tot = ws.getRow(5 + revenueByMonth.length + 1)
          tot.getCell(1).value = ''
          tot.getCell(2).value = 'TOTAL'; Object.assign(tot.getCell(2), headerStyle(ExcelJS, { bg: COLOR.navyDark }))
          tot.getCell(3).value = totalRev; Object.assign(tot.getCell(3), headerStyle(ExcelJS, { bg: COLOR.green }))
          tot.getCell(3).numFmt = '"$"#,##0.00'
          tot.getCell(4).value = totalOrd; Object.assign(tot.getCell(4), headerStyle(ExcelJS, { bg: COLOR.navyDark }))
          tot.getCell(5).value = totalOrd > 0 ? totalRev / totalOrd : 0
          Object.assign(tot.getCell(5), headerStyle(ExcelJS, { bg: COLOR.navyDark }))
          tot.getCell(5).numFmt = '"$"#,##0.00'
          tot.height = 22; tot.commit()
        } else {
          const row = ws.getRow(5)
          ws.mergeCells('A5:E5')
          row.getCell(1).value = 'Sin datos de ventas para el período seleccionado'
          Object.assign(row.getCell(1), cellStyle({ align: 'center', color: COLOR.grayText }))
          row.commit()
        }
      }

      /* ══════════════════════════════════════════════════════════════
         SHEET 3 — Productividad de Agentes
      ══════════════════════════════════════════════════════════════ */
      {
        const ws = wb.addWorksheet('Productividad Agentes', { properties: { tabColor: { argb: 'FFEEF4ED' } } })
        ws.columns = [
          { width: 6 }, { width: 30 }, { width: 20 }, { width: 14 }, { width: 22 }, { width: 18 },
        ]

        titleBlock(ws, '🏆 Productividad de Agentes', `Top agentes por ingresos — ${periodLabel}`)

        const h = ws.getRow(4)
        applyRow(h, ['#', 'Agente', 'Ingresos (USD)', 'Órdenes', 'Ticket Promedio (USD)', 'Ciudad'],
          Array(6).fill(headerStyle(ExcelJS))
        )

        if (topAgents.length > 0) {
          topAgents.forEach((agent, i) => {
            const bg  = i === 0 ? COLOR.mint : i % 2 === 0 ? COLOR.gray : COLOR.white
            const rev = Number(agent.totalRevenue) || 0
            const ord = Number(agent.totalOrders) || 0
            const avg = ord > 0 ? rev / ord : 0

            const row = ws.getRow(5 + i)
            row.getCell(1).value = i + 1; Object.assign(row.getCell(1), cellStyle({ align: 'center', bg, bold: i === 0, color: i === 0 ? COLOR.navy : COLOR.grayText }))
            row.getCell(2).value = agent.displayName || agent.name || `Agente ${i + 1}`
            Object.assign(row.getCell(2), cellStyle({ bold: true, bg, color: COLOR.navy }))
            row.getCell(3).value = rev; Object.assign(row.getCell(3), cellStyle({ align: 'right', bold: true, bg, color: COLOR.green }))
            row.getCell(3).numFmt = '"$"#,##0.00'
            row.getCell(4).value = ord; Object.assign(row.getCell(4), cellStyle({ align: 'center', bg }))
            row.getCell(5).value = avg; Object.assign(row.getCell(5), cellStyle({ align: 'right', bg, color: COLOR.grayText }))
            row.getCell(5).numFmt = '"$"#,##0.00'
            row.getCell(6).value = agent.city || '—'; Object.assign(row.getCell(6), cellStyle({ bg, color: COLOR.grayText }))
            row.height = 20; row.commit()
          })
        } else {
          ws.mergeCells('A5:F5')
          const row = ws.getRow(5)
          row.getCell(1).value = 'Sin datos de agentes disponibles'
          Object.assign(row.getCell(1), cellStyle({ align: 'center', color: COLOR.grayText }))
          row.commit()
        }
      }

      /* ══════════════════════════════════════════════════════════════
         SHEET 4 — Rendimiento por Categoría
      ══════════════════════════════════════════════════════════════ */
      {
        const ws = wb.addWorksheet('Rend. por Categoría', { properties: { tabColor: { argb: 'FFC5D8E8' } } })
        ws.columns = [
          { width: 6 }, { width: 28 }, { width: 20 }, { width: 14 }, { width: 20 }, { width: 14 },
        ]

        titleBlock(ws, '📦 Rendimiento por Categoría', `Distribución de ventas por rubro — ${periodLabel}`)

        const h = ws.getRow(4)
        applyRow(h, ['#', 'Categoría', 'Ingresos (USD)', 'Órdenes', 'Margen Est. (USD)', '% del Total'],
          Array(6).fill(headerStyle(ExcelJS))
        )

        if (categories.length > 0) {
          const totalRev = categories.reduce((s, c) => s + (Number(c.totalRevenue) || 0), 0) || 1

          categories.forEach((cat, i) => {
            const bg  = i % 2 === 0 ? COLOR.gray : COLOR.white
            const rev = Number(cat.totalRevenue) || 0
            const ord = Number(cat.totalOrders) || 0
            const cost = Number(cat.totalCost) || (rev * 0.7)
            const margin = rev - cost
            const pct = ((rev / totalRev) * 100).toFixed(1)

            const row = ws.getRow(5 + i)
            row.getCell(1).value = i + 1; Object.assign(row.getCell(1), cellStyle({ align: 'center', bg, color: COLOR.grayText }))
            row.getCell(2).value = cat.category || 'Sin Categoría'; Object.assign(row.getCell(2), cellStyle({ bold: true, bg, color: COLOR.navy }))
            row.getCell(3).value = rev; Object.assign(row.getCell(3), cellStyle({ align: 'right', bold: true, bg, color: COLOR.green }))
            row.getCell(3).numFmt = '"$"#,##0.00'
            row.getCell(4).value = ord; Object.assign(row.getCell(4), cellStyle({ align: 'center', bg }))
            row.getCell(5).value = margin; Object.assign(row.getCell(5), cellStyle({ align: 'right', bg, color: margin >= 0 ? COLOR.green : COLOR.red }))
            row.getCell(5).numFmt = '"$"#,##0.00'
            row.getCell(6).value = `${pct}%`; Object.assign(row.getCell(6), cellStyle({ align: 'center', bg, color: COLOR.teal }))
            row.height = 20; row.commit()
          })
        } else {
          ws.mergeCells('A5:F5')
          const row = ws.getRow(5)
          row.getCell(1).value = 'Sin datos de categorías disponibles'
          Object.assign(row.getCell(1), cellStyle({ align: 'center', color: COLOR.grayText }))
          row.commit()
        }
      }

      /* ══════════════════════════════════════════════════════════════
         SHEET 5 — Órdenes por Ciudad
      ══════════════════════════════════════════════════════════════ */
      {
        const ws = wb.addWorksheet('Órdenes por Ciudad', { properties: { tabColor: { argb: 'FF13315C' } } })
        ws.columns = [
          { width: 6 }, { width: 28 }, { width: 18 }, { width: 18 },
        ]

        titleBlock(ws, '🌆 Órdenes por Ciudad', `Distribución geográfica — ${periodLabel}`)

        const h = ws.getRow(4)
        applyRow(h, ['#', 'Ciudad', 'Total Órdenes', '% del Total'],
          Array(4).fill(headerStyle(ExcelJS))
        )

        if (cities.length > 0) {
          const totalOrd = cities.reduce((s, c) => s + (Number(c.totalOrders) || 0), 0) || 1

          cities.forEach((city, i) => {
            const bg  = i % 2 === 0 ? COLOR.gray : COLOR.white
            const ord = Number(city.totalOrders) || 0
            const pct = ((ord / totalOrd) * 100).toFixed(1)

            const row = ws.getRow(5 + i)
            row.getCell(1).value = i + 1; Object.assign(row.getCell(1), cellStyle({ align: 'center', bg, color: COLOR.grayText }))
            row.getCell(2).value = city.city || 'Desconocida'; Object.assign(row.getCell(2), cellStyle({ bold: true, bg, color: COLOR.navy }))
            row.getCell(3).value = ord; Object.assign(row.getCell(3), cellStyle({ align: 'center', bold: true, bg, color: COLOR.navyDark }))
            row.getCell(4).value = `${pct}%`; Object.assign(row.getCell(4), cellStyle({ align: 'center', bg, color: COLOR.teal }))
            row.height = 20; row.commit()
          })
        } else {
          ws.mergeCells('A5:D5')
          const row = ws.getRow(5)
          row.getCell(1).value = 'Sin datos de ciudades disponibles'
          Object.assign(row.getCell(1), cellStyle({ align: 'center', color: COLOR.grayText }))
          row.commit()
        }
      }

      /* ── Download ────────────────────────────────────────────────── */
      const buffer = await wb.xlsx.writeBuffer()
      const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const a      = document.createElement('a')
      a.href       = URL.createObjectURL(blob)
      a.download   = `TeVra_Dashboard_Pro_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.style.visibility = 'hidden'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(a.href)

    } catch (err) {
      console.error('TeVra Excel Service — Error:', err)
      alert('Error al generar el reporte Excel. Revisa la consola para más detalles.')
    }
  },
}

export default excelService
