import Nav from '@/components/nav'
import { fetchUpcomingSlams } from '@/lib/upcoming-slams'

const FB_POST_URL =
  'https://www.facebook.com/slamartpl/posts/pfbid02UoF1VKkjG3GGHjFLd2RY5F1ArAGN7Cc2CgCTHr4ipco5LJFgxqbHmofspahpGTJol?locale=pl_PL'

export default async function NadchodzaceSlamyPage() {
  const slams = await fetchUpcomingSlams()

  return (
    <main className="min-h-screen flex flex-col">
      <Nav active="nadchodzace-slamy" />

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
            href={FB_POST_URL}
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
            <a
              href={FB_POST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c0392b] hover:underline text-sm mt-2 inline-block"
            >
              Zobacz na SLAM.ART.PL →
            </a>
          </div>
        ) : (
          <>
            {/* Nagłówek kolumn */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-4 pb-2 border-b border-[#2a2a2a]">
              <p className="text-xs font-bold text-[#555] uppercase tracking-widest">
                Data · Godzina · Miasto · Wydarzenie
              </p>
            </div>

            <div className="divide-y divide-[#181818]">
              {slams.map((slam, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center py-3 px-4 hover:bg-[#0f0f0f] transition-colors group"
                >
                  {/* Lewa kolumna: data + godzina + miasto + tytuł w jednym wierszu */}
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
                      <p className="text-[#444] text-xs mt-0.5 pl-0">{slam.venue}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={FB_POST_URL}
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
    </main>
  )
}
