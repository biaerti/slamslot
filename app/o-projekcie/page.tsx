import Nav from '@/components/nav'
import Link from 'next/link'
import Image from 'next/image'

export default function OProjekcie() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav active="o-projekcie" />

      <div className="max-w-2xl mx-auto px-6 py-14 w-full">
        <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-3">
          O projekcie
        </p>
        <h1 className="font-display text-5xl text-white leading-none mb-10">
          SLAMSLOT
        </h1>

        <div className="space-y-10 text-[#aaa] text-sm leading-relaxed">

          <section>
            <p className="text-base text-[#ddd] leading-relaxed">
              SlamSlot powstał z obserwacji — organizatorzy slamów poetyckich żonglują zapisami
              przez maile i arkusze kalkulacyjne. Jako osoba zajmująca się automatyzacją procesów
              postanowiłem im to ułatwić.
            </p>
            <p className="mt-4 text-base text-[#ddd] leading-relaxed">
              Narzędzie jest <strong className="text-white">non-profit</strong> — stworzone
              dla środowiska slamowego w Polsce, żeby ułatwić życie zarówno organizatorom
              jak i uczestnikom. Nie ma reklam, nie zbieramy danych do celów komercyjnych,
              nie pobieramy opłat.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-4 uppercase tracking-wide">Twórca</h2>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-white font-semibold">Bartosz Kuniński</p>
                <p className="text-[#666] text-xs mt-0.5">biaerti (slamowa ksywa) · automatyzacje procesów</p>
              </div>
            </div>
            <p>
              Projekt realizowany pod szyldem{' '}
              <a
                href="https://www.destruktura.pl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#c0392b] underline underline-offset-2 transition-colors"
              >
                Fundacji Destruktura
              </a>
              {' '}— organizacji pozarządowej działającej na rzecz kultury, sztuki i edukacji
              z siedzibą w Toruniu.
            </p>
          </section>

          {/* Logo Destruktury */}
          <section>
            <a
              href="https://www.destruktura.pl/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block opacity-60 hover:opacity-100 transition-opacity"
            >
              <Image
                src="/logo.svg"
                alt="Fundacja Destruktura"
                width={240}
                height={61}
              />
            </a>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3 uppercase tracking-wide">Koszty i utrzymanie</h2>
            <p>
              Serwis działa na darmowych lub niskokosztowych planach zewnętrznych usług.
              Jeśli korzystasz z SlamSlot i chcesz wesprzeć projekt, możesz wpłacić
              dobrowolną darowiznę na rzecz Fundacji Destruktura:
            </p>
            <div className="mt-4 bg-[#111] border border-[#2a2a2a] p-4 space-y-1.5">
              <p className="text-white font-semibold">Fundacja Destruktura</p>
              <p className="font-mono text-[#aaa] text-xs">ING Bank Śląski · PL 07 1050 1823 1000 0097 0108 6648</p>
              <p className="text-[#666] text-xs">Tytuł: <span className="text-[#888]">darowizna na cele statutowe Fundacji Destruktura</span></p>
            </div>
            <p className="mt-3 text-[#555] text-xs">
              Nie planujemy wprowadzać płatności. Ewentualne koszty (np. wysyłka maili przy bardzo dużym ruchu)
              postaramy się pokryć z darowizn.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3 uppercase tracking-wide">Polityka prywatności</h2>
            <p>
              Zbieramy tylko dane niezbędne do obsługi zapisów. Dane uczestników są automatycznie
              usuwane po 90 dniach od daty slamu. Administratorem danych jest Fundacja Destruktura.
            </p>
            <Link
              href="/polityka-prywatnosci"
              className="inline-block mt-3 text-[#c0392b] hover:underline text-xs"
            >
              Pełna polityka prywatności →
            </Link>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-3 uppercase tracking-wide">Kontakt</h2>
            <p>
              Pytania, zgłoszenia błędów, propozycje funkcji:{' '}
              <a href="mailto:kontakt@slamslot.pl" className="text-[#c0392b] hover:underline">
                kontakt@slamslot.pl
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-[#2a2a2a]">
          <Link href="/" className="text-xs text-[#c0392b] hover:underline">
            ← Wróć do SlamSlot
          </Link>
        </div>
      </div>
    </main>
  )
}
