'use client'

import { useState } from 'react'
import type { DashboardData } from '@/types'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ExportModalProps {
  data: DashboardData
  formattedDate: string
  onClose: () => void
}

export default function ExportModal({ data, formattedDate, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | 'pdf' | null>(null)
  const [includeCancelled, setIncludeCancelled] = useState(false)

  const rows = [
    ...data.confirmed.map((r) => ({ ...r, listStatus: 'Lista główna', listStatusPDF: 'Glowna' })),
    ...data.waiting.map((r) => ({ ...r, listStatus: 'Rezerwowa', listStatusPDF: 'Rezerwa' })),
    ...(includeCancelled ? (data.cancelled ?? []).map((r) => ({ ...r, listStatus: 'Anulowany', listStatusPDF: 'Anulowany' })) : []),
  ]

  // jsPDF + helvetica nie obsługuje polskich znaków — transliteracja
  const pl2ascii = (s: string) =>
    s.replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
     .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z')
     .replace(/Ą/g,'A').replace(/Ć/g,'C').replace(/Ę/g,'E').replace(/Ł/g,'L')
     .replace(/Ń/g,'N').replace(/Ó/g,'O').replace(/Ś/g,'S').replace(/Ź/g,'Z').replace(/Ż/g,'Z')

  const handleCSV = () => {
    setExporting('csv')
    const headers = ['Poz.', 'Imię / pseudonim', 'Email', 'Telefon', 'Notatka', 'Lista', 'Data zapisu']
    const csvRows = [
      headers,
      ...rows.map((r) => [
        r.position,
        r.name,
        r.email,
        r.phone ?? '',
        r.note ?? '',
        r.listStatus,
        format(new Date(r.registered_at), 'd MMM yyyy HH:mm', { locale: pl }),
      ]),
    ]
    const csv = csvRows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    download('\uFEFF' + csv, `${data.slam.name} — uczestnicy.csv`, 'text/csv;charset=utf-8;')
    setExporting(null)
  }

  const handleXLSX = async () => {
    setExporting('xlsx')
    const { utils, writeFile } = await import('xlsx')
    const wsData = [
      ['Poz.', 'Imię / pseudonim', 'Email', 'Telefon', 'Notatka', 'Lista', 'Data zapisu'],
      ...rows.map((r) => [
        r.position,
        r.name,
        r.email,
        r.phone ?? '',
        r.note ?? '',
        r.listStatus,
        format(new Date(r.registered_at), 'd MMM yyyy HH:mm', { locale: pl }),
      ]),
    ]
    const ws = utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 5 }, { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 18 }]
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Uczestnicy')
    writeFile(wb, `${data.slam.name} — uczestnicy.xlsx`)
    setExporting(null)
  }

  const handlePDF = async () => {
    setExporting('pdf')
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Tło
    doc.setFillColor(10, 10, 10)
    doc.rect(0, 0, 210, 297, 'F')

    // Czerwona linia top
    doc.setFillColor(192, 57, 43)
    doc.rect(0, 0, 210, 2, 'F')

    // Nagłówek — nazwa slamu
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.text(pl2ascii(data.slam.name.toUpperCase()), 14, 18)

    // Data i info
    doc.setFontSize(9)
    doc.setTextColor(136, 136, 136)
    doc.setFont('helvetica', 'normal')
    doc.text(pl2ascii(formattedDate), 14, 25)
    doc.text(`Lista glowna: ${data.confirmed.length} os.   Rezerwa: ${data.waiting.length} os.`, 14, 30)

    // Logo tekst
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text('slamslot.pl', 196, 18, { align: 'right' })

    // Separator
    doc.setDrawColor(42, 42, 42)
    doc.setLineWidth(0.3)
    doc.line(14, 34, 196, 34)

    // Tabela
    autoTable(doc, {
      startY: 38,
      head: [['#', 'Imie / pseudonim', 'Email', 'Telefon', 'Lista']],
      body: rows.map((r) => [
        r.position,
        pl2ascii(r.name),
        r.email,
        r.phone ?? '-',
        r.listStatusPDF,
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: [200, 200, 200],
        fillColor: [15, 15, 15],
        lineColor: [42, 42, 42],
        lineWidth: 0.2,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [20, 20, 20],
        textColor: [192, 57, 43],
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [18, 18, 18],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 48 },
        2: { cellWidth: 58 },
        3: { cellWidth: 28 },
        4: { cellWidth: 28 },
      },
      margin: { left: 14, right: 14 },
    })

    // Stopka
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(192, 57, 43)
      doc.rect(0, 295, 210, 2, 'F')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      doc.text(`Wygenerowano: ${pl2ascii(format(new Date(), 'd MMM yyyy, HH:mm', { locale: pl }))}`, 14, 293)
      doc.text(`${i} / ${pageCount}`, 196, 293, { align: 'right' })
    }

    doc.save(`${data.slam.name} — uczestnicy.pdf`)
    setExporting(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] border border-[#2a2a2a] w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Eksportuj listę uczestników</p>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] text-lg leading-none">×</button>
        </div>

        <p className="text-xs text-[#444] mb-4">
          {data.confirmed.length + data.waiting.length}{includeCancelled && (data.cancelled?.length ?? 0) > 0 ? ` + ${data.cancelled.length} anulowanych` : ''} uczestników ({data.confirmed.length} lista główna, {data.waiting.length} rezerwowa)
        </p>

        {(data.cancelled?.length ?? 0) > 0 && (
          <label className="flex items-center gap-2 cursor-pointer group mb-5">
            <input
              type="checkbox"
              checked={includeCancelled}
              onChange={(e) => setIncludeCancelled(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#c0392b]"
            />
            <span className="text-xs text-[#555] group-hover:text-[#aaa] transition-colors">
              Uwzględnij anulowanych ({data.cancelled.length})
            </span>
          </label>
        )}

        <div className="space-y-2">
          <button
            onClick={handlePDF}
            disabled={!!exporting}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-[#c0392b]/40 hover:border-[#c0392b] text-left transition-colors disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-bold text-white">PDF</p>
              <p className="text-xs text-[#555]">do druku, czarno-czerwony design</p>
            </div>
            <span className="text-[#c0392b] text-lg">{exporting === 'pdf' ? '...' : '↓'}</span>
          </button>

          <button
            onClick={handleXLSX}
            disabled={!!exporting}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-[#2a2a2a] hover:border-[#444] text-left transition-colors disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-bold text-white">Excel (XLSX)</p>
              <p className="text-xs text-[#555]">otwiera się w Excelu i Google Sheets</p>
            </div>
            <span className="text-[#555] text-lg">{exporting === 'xlsx' ? '...' : '↓'}</span>
          </button>

          <button
            onClick={handleCSV}
            disabled={!!exporting}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-[#2a2a2a] hover:border-[#444] text-left transition-colors disabled:opacity-50"
          >
            <div>
              <p className="text-sm font-bold text-white">CSV</p>
              <p className="text-xs text-[#555]">uniwersalny format tekstowy</p>
            </div>
            <span className="text-[#555] text-lg">{exporting === 'csv' ? '...' : '↓'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
