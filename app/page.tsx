import CreateSlamForm from '@/components/create-slam-form'
import Nav from '@/components/nav'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav active="stworz-slam" />

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Hero left */}
        <div className="lg:w-1/2 bg-[#0a0a0a] px-8 py-16 lg:px-16 flex flex-col justify-center border-r border-[#2a2a2a]">
          <p className="font-display text-7xl lg:text-9xl text-white leading-none">
            SLAM
          </p>
          <p className="font-display text-7xl lg:text-9xl text-[#c0392b] leading-none">
            ZAPISY
          </p>
          <p className="mt-6 text-[#aaa] text-lg max-w-md leading-relaxed">
            Stwórz formularz zapisów na slam poetycki w kilka sekund.
            Uczestnicy zapisują się przez link, Ty zarządzasz listą z dashboardu.
          </p>
          <div className="mt-8 space-y-2 text-sm text-[#666]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#c0392b] inline-block" />
              Automatyczne potwierdzenia emailem
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#c0392b] inline-block" />
              Lista główna + lista rezerwowa
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#c0392b] inline-block" />
              Powiadomienia o zwolnieniu miejsca
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#c0392b] inline-block" />
              Bez rejestracji konta
            </div>
          </div>
        </div>

        {/* Form right */}
        <div className="lg:w-1/2 px-8 py-2 lg:px-12 flex flex-col justify-center bg-[#0d0d0d] lg:overflow-y-auto">
          <p className="font-display text-2xl text-white mb-1 tracking-wide">
            STWÓRZ SLAM
          </p>
          <CreateSlamForm />
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-3 flex items-center justify-between">
        <p className="text-xs text-[#333]">
          © Fundacja Destruktura · non-profit
        </p>
        <div className="flex gap-4 text-xs">
          <Link href="/o-projekcie" className="text-[#333] hover:text-[#666] transition-colors">O projekcie</Link>
          <Link href="/polityka-prywatnosci" className="text-[#333] hover:text-[#666] transition-colors">Polityka prywatności</Link>
        </div>
      </footer>
    </main>
  )
}
