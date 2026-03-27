import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import RegistrationForm from '@/components/registration-form'
import Nav from '@/components/nav'
import ExpandableDescription from '@/components/expandable-description'
import type { SlamPublic } from '@/types'

export default async function SlamPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/slams/${id}`, { cache: 'no-store' })

  if (!res.ok) notFound()

  const slam: SlamPublic = await res.json()
  const spotsLeft = slam.max_participants - slam.confirmed_count
  const isFull = spotsLeft <= 0
  const dateObj = new Date(slam.event_date.replace(' ', 'T'))
  const formattedDate = isNaN(dateObj.getTime())
    ? slam.event_date
    : format(dateObj, "EEEE, d MMMM yyyy 'o' HH:mm", { locale: pl })

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Event info */}
        <div className="lg:w-1/2 px-8 py-16 lg:px-16 flex flex-col justify-center border-r border-[#2a2a2a] relative overflow-hidden">
          {slam.image_url && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${slam.image_url})` }}
              />
              <div className="absolute inset-x-0 top-0 h-[40px] z-10" style={{ background: 'linear-gradient(to bottom, #0d0d0d, transparent)' }} />
              <div className="absolute inset-x-0 bottom-0 h-[40px] z-10" style={{ background: 'linear-gradient(to top, #0d0d0d, transparent)' }} />
            </>
          )}
          <div className="relative z-10">
          <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-4">
            Slam poetycki
          </p>
          <h1 className="font-display text-5xl lg:text-7xl text-white leading-none mb-2">
            {slam.name}
          </h1>
          <p className="text-[#666] text-sm mb-6">{slam.organizer_name}</p>
          {slam.description && (
            <ExpandableDescription text={slam.description} />
          )}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full" />
              <span className="text-[#aaa]">
                <span className="text-white font-semibold">Data:</span> {formattedDate}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-yellow-500' : 'bg-green-500'}`}
              />
              <span className="text-[#aaa]">
                <span className="text-white font-semibold">Miejsca:</span>{' '}
                {isFull
                  ? `Brak miejsc (${slam.waiting_count} osób na liście rez.)`
                  : `${spotsLeft} z ${slam.max_participants} dostępnych`}
              </span>
            </div>
            {slam.fb_event_url && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#555] rounded-full" />
                <a
                  href={slam.fb_event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#aaa] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 13h-5v7h-2v-7H6v-2h5V6a3 3 0 0 1 3-3h4v2h-4a1 1 0 0 0-1 1v5h5l-1 2z"/>
                  </svg>
                  Event na Facebooku
                </a>
              </div>
            )}
            {slam.location && (
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#555] rounded-full" />
                {slam.location.startsWith('http') ? (
                  <a
                    href={slam.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#aaa] hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Lokalizacja
                  </a>
                ) : (
                  <span className="text-[#aaa] flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {slam.location}
                  </span>
                )}
              </div>
            )}
          </div>

          {isFull && (
            <div className="mt-6 border-l-4 border-yellow-500 pl-4 bg-yellow-900/10 py-3 pr-4">
              <p className="text-yellow-400 text-sm font-semibold">
                Wszystkie miejsca zajęte
              </p>
              <p className="text-[#aaa] text-sm mt-1">
                Możesz zapisać się na listę rezerwową. Dostaniesz maila jeśli zwolni się miejsce.
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Registration form */}
        <div className="lg:w-1/2 px-8 py-8 lg:px-16 flex flex-col justify-center bg-[#0d0d0d]">
          <p className="font-display text-3xl text-white mb-2 tracking-wide">
            {isFull ? 'LISTA REZERWOWA' : 'ZAPISZ SIĘ'}
          </p>
          <p className="text-[#555] text-sm mb-8">
            {isFull
              ? 'Zostaniesz powiadomiony/a emailem jeśli zwolni się miejsce.'
              : 'Wypełnij formularz — potwierdzenie przyjdzie na maila.'}
          </p>
          <RegistrationForm slamId={slam.id} slamName={slam.name} organizerName={slam.organizer_name} />
        </div>
      </div>
    </main>
  )
}
