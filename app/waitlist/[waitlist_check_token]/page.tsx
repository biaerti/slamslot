import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import Link from 'next/link'
import Nav from '@/components/nav'

export default async function WaitlistPage(
  props: { params: Promise<{ waitlist_check_token: string }> }
) {
  const { waitlist_check_token } = await props.params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/waitlist/${waitlist_check_token}`, {
    cache: 'no-store',
  })

  if (!res.ok) notFound()

  const data = await res.json()
  const {
    name,
    position,
    status,
    slam_name,
    slam_date,
  } = data

  const isNowConfirmed = status === 'confirmed'
  const formattedDate = format(new Date(slam_date), "d MMMM yyyy, HH:mm", { locale: pl })

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">
            Status zapisu
          </p>
          <h1 className="font-display text-5xl text-white leading-none mb-2">
            {slam_name}
          </h1>
          <p className="text-[#888] text-sm mb-8">{formattedDate}</p>

          {isNowConfirmed ? (
            <div className="border-l-4 border-[#c0392b] pl-6 py-4 bg-[#1a0a0a]">
              <p className="font-display text-2xl text-[#c0392b]">JESTEŚ NA LIŚCIE GŁÓWNEJ!</p>
              <p className="text-[#aaa] mt-2 text-sm">
                Dostałeś/łaś się — sprawdź skrzynkę email, wysłaliśmy Ci potwierdzenie.
              </p>
            </div>
          ) : (
            <div className="border border-[#2a2a2a] bg-[#141414] p-8 text-center">
              <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-2">
                Twoja pozycja na liście rezerwowej
              </p>
              <p className="font-display text-8xl text-yellow-400 leading-none">
                #{position}
              </p>
              <p className="text-[#aaa] text-sm mt-4">
                Uczestnik: <span className="text-white font-semibold">{name}</span>
              </p>
              <p className="text-[#555] text-xs mt-4">
                Gdy zwolni się miejsce, przesuniemy Cię automatycznie na listę główną
                i wyślemy email.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs text-[#444] text-center">
            Ta strona pokazuje aktualny status. Odśwież, żeby sprawdzić najnowsze dane.
          </p>

          <div className="mt-4 text-center">
            <button
              onClick={undefined}
              className="text-xs text-[#555] hover:text-[#aaa] transition-colors mr-4"
            >
              {/* client reload via Link for simplicity */}
            </button>
            <Link
              href={`/waitlist/${waitlist_check_token}`}
              className="text-xs text-[#c0392b] hover:text-[#e74c3c] transition-colors"
            >
              Odśwież status →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
