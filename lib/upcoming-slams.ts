// Google Docs z rozpiską slamów SLAM.ART.PL — eksport jako plain text
const GDOCS_URL =
  'https://docs.google.com/document/d/1rvVnRo7dCsP9UzxUL7sRkuqbMnpjIMg11TCkj2UrkNE/export?format=txt'

export interface UpcomingSlam {
  date: string        // "26.03.2026"
  time: string | null // "18.00" lub null
  city: string
  title: string
  venue: string | null
}

// Format linii: "* 26.03.2026, godz. 18.00 - GDAŃSK - Tytuł, Venue"
// lub:          "* 26.03.2026 - BIAŁYSTOK - Tytuł, Venue"
function parseLine(raw: string): UpcomingSlam | null {
  // Usuń bullet "* " i białe znaki
  const line = raw.replace(/^\*\s*/, '').trim()
  if (!line || !/^\d{2}\.\d{2}\.\d{4}/.test(line)) return null

  const dateMatch = line.match(/^(\d{2}\.\d{2}\.\d{4})/)
  if (!dateMatch) return null
  const date = dateMatch[1]

  const timeMatch = line.match(/godz\.\s*(\d{2}[.:]\d{2})/)
  const time = timeMatch ? timeMatch[1].replace(':', '.') : null

  // Usuń datę i godzinę, rozbij po " - "
  const stripped = line
    .slice(date.length)
    .replace(/,?\s*godz\.\s*\d{2}[.:]\d{2}/, '')
    .trim()

  // stripped zaczyna się od " - MIASTO - reszta"
  const parts = stripped.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return null

  const city = parts[0].toUpperCase()
  const rest = parts.slice(1).join(' – ')

  // Ostatni fragment po przecinku to venue
  const lastComma = rest.lastIndexOf(', ')
  let title = rest
  let venue: string | null = null
  if (lastComma > 0) {
    title = rest.slice(0, lastComma).trim()
    venue = rest.slice(lastComma + 2).trim()
  }

  return { date, time, city, title, venue }
}

export async function fetchUpcomingSlams(): Promise<UpcomingSlam[]> {
  try {
    const res = await fetch(GDOCS_URL, {
      next: { revalidate: 3600 }, // cache na 1 godzinę
    })
    if (!res.ok) return []
    const text = await res.text()

    return text
      .split('\n')
      .map(parseLine)
      .filter((s): s is UpcomingSlam => s !== null)
  } catch {
    return []
  }
}
