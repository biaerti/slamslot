'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { UpcomingSlam } from '@/lib/upcoming-slams'

interface SlamSlotEntry {
  id: string
  name: string
  location: string | null
  event_date: string
}

function normalizeCity(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Wyciąga miasto z "Miasto / Lokal" lub "Lokal (Miasto)"
function extractCity(location: string | null): string {
  if (!location) return ''
  const before = location.split('/')[0].trim()
  return normalizeCity(before)
}

function parseDatePL(dateStr: string): string | null {
  // "26.03.2026" → "2026-03-26"
  const m = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!m) return null
  return `${m[3]}-${m[2]}-${m[1]}`
}

function slamSlotDateStr(eventDate: string): string {
  // "2026-03-26 18:00:00" → "2026-03-26"
  return eventDate.slice(0, 10)
}

function findMatch(
  upcoming: UpcomingSlam,
  slamslotEntries: SlamSlotEntry[]
): SlamSlotEntry | null {
  const upcomingDate = parseDatePL(upcoming.date)
  if (!upcomingDate) return null
  const upcomingCity = normalizeCity(upcoming.city)

  for (const entry of slamslotEntries) {
    const entryDate = slamSlotDateStr(entry.event_date)
    if (entryDate !== upcomingDate) continue

    const entryCity = extractCity(entry.location)
    if (!entryCity) continue

    if (upcomingCity.includes(entryCity) || entryCity.includes(upcomingCity)) {
      return entry
    }
  }
  return null
}

export default function NadchodzaceSlamyClient({
  slams,
  fbPostUrl,
}: {
  slams: UpcomingSlam[]
  fbPostUrl: string
}) {
  const [slamslotEntries, setSlamslotEntries] = useState<SlamSlotEntry[]>([])

  useEffect(() => {
    fetch('/api/slams/public')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setSlamslotEntries(data) })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-14 w-full">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-3">
            Lista wydarzeń na podstawie rozpiski SLAM.ART.PL
          </p>
          <h1 className="font-display text-6xl text-white leading-none">
            NADCHODZĄCE<br />SLAMY
          </h1>
        </div>
        <a
          href={fbPostUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm text-[#c0392b] border border-[#c0392b] hover:bg-[#c0392b] hover:text-white px-4 py-2 font-bold tracking-wide transition-colors hidden md:block"
        >
          Pełna lista na SLAM.ART.PL →
        </a>
      </div>

      {slams.length === 0 ? (
        <div className="border border-dashed border-[#2a2a2a] p-12 text-center text-[#444]">
          <p>Nie udało się załadować listy slamów.</p>
          <a href={fbPostUrl} target="_blank" rel="noopener noreferrer"
            className="text-[#c0392b] hover:underline text-sm mt-2 inline-block">
            Zobacz na SLAM.ART.PL →
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 pb-2 border-b border-[#2a2a2a]">
            <p className="text-xs font-bold text-[#555] uppercase tracking-widest">
              Data · Godzina · Miasto · Wydarzenie
            </p>
          </div>

          <div className="divide-y divide-[#181818]">
            {slams.map((slam, i) => {
              const match = findMatch(slam, slamslotEntries)
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center py-3 px-4 hover:bg-[#0f0f0f] transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-sm text-[#c0392b] font-bold shrink-0">
                        {slam.date}
                      </span>
                      {slam.time && (
                        <span className="font-mono text-sm text-[#555] shrink-0">
                          {slam.time}
                        </span>
                      )}
                      <span className="font-display text-base text-white tracking-wide shrink-0">
                        {slam.city}
                      </span>
                      <span className="text-[#888] text-sm truncate">
                        {slam.title}
                      </span>
                    </div>
                    {slam.venue && (
                      <p className="text-[#444] text-xs mt-0.5">{slam.venue}</p>
                    )}
                  </div>

                  {match && (
                    <Link
                      href={`/slam/${match.id}`}
                      className="shrink-0 text-xs font-bold text-[#c0392b] border border-[#c0392b] hover:bg-[#c0392b] hover:text-white px-3 py-1.5 transition-colors whitespace-nowrap"
                    >
                      Zapisz się →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          <a
            href={fbPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block md:hidden mt-6 text-center text-sm text-[#c0392b] border border-[#c0392b] py-2 font-bold"
          >
            Pełna lista na SLAM.ART.PL →
          </a>

          <p className="mt-8 text-xs text-[#333] text-center">
            Lista pochodzi z rozpiski SLAM.ART.PL. Aktualizowana co godzinę.
          </p>
        </>
      )}
    </div>
  )
}
