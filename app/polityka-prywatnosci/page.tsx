import Nav from '@/components/nav'
import Link from 'next/link'

export default function PolitykaPrywatnosci() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-14 w-full">
        <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-3">
          Dokument prawny
        </p>
        <h1 className="font-display text-5xl text-white leading-none mb-10">
          POLITYKA<br />PRYWATNOŚCI
        </h1>

        <div className="space-y-8 text-[#aaa] text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Administrator danych</h2>
            <p>
              Administratorem danych osobowych zbieranych za pośrednictwem SlamSlot jest{' '}
              <a href="https://destruktura.pl" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#c0392b] underline underline-offset-2 transition-colors">Fundacja Destruktura</a>
              {' '}z siedzibą przy ul. Lotników 9B/7, 87-100 Toruń (KRS: 0001060535, NIP: 9562387256).
              W sprawach dotyczących danych osobowych skontaktuj się z nami:{' '}
              <a href="mailto:kontakt@slamslot.pl" className="text-[#c0392b] hover:underline">kontakt@slamslot.pl</a>.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Jakie dane zbieramy</h2>
            <p>Podczas rejestracji na wydarzenie zbieramy:</p>
            <ul className="mt-2 space-y-1 list-none">
              {['Imię, nazwisko lub pseudonim sceniczny', 'Adres email', 'Numer telefonu (opcjonalnie)', 'Uwagi przekazane dobrowolnie'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c0392b] shrink-0 inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Cel i podstawa przetwarzania</h2>
            <p>
              Dane przetwarzamy wyłącznie w celu organizacji i obsługi zapisów na slam poetycki,
              w tym wysyłki potwierdzeń, powiadomień o liście rezerwowej oraz informacji o zwolnieniu miejsca.
              Podstawą prawną jest Twoja zgoda (art. 6 ust. 1 lit. a RODO), wyrażona przy rejestracji.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Okres przechowywania</h2>
            <p>
              Dane uczestników są przechowywane przez <strong className="text-white">90 dni</strong> od daty
              danego slamu, po czym są trwale usuwane z bazy danych. Organizator może usunąć Twoje
              dane wcześniej ręcznie z poziomu dashboardu.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Twoje prawa</h2>
            <p>Masz prawo do:</p>
            <ul className="mt-2 space-y-1 list-none">
              {[
                'Dostępu do swoich danych',
                'Sprostowania danych',
                'Usunięcia danych (możesz anulować zapis przez link w mailu)',
                'Cofnięcia zgody w dowolnym momencie',
                'Wniesienia skargi do Prezesa UODO',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c0392b] shrink-0 inline-block" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Dostęp do danych</h2>
            <p>
              Dane uczestników są dostępne wyłącznie organizatorowi danego slamu (poprzez unikalny link
              do dashboardu) oraz administratorowi serwisu (Fundacja Destruktura). Dane nie są
              przekazywane podmiotom trzecim ani wykorzystywane w celach marketingowych.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Narzędzia zewnętrzne</h2>
            <p>
              Serwis korzysta z infrastruktury Supabase (baza danych) oraz Resend (wysyłka emaili transakcyjnych). Dane przechowywane są na serwerach Supabase zlokalizowanych w Wielkiej Brytanii (Londyn, region eu-west-2). Wielka Brytania posiada decyzję adequacy Komisji Europejskiej, co oznacza że poziom ochrony danych jest uznany za równoważny z RODO. Oba serwisy przetwarzają dane wyłącznie w zakresie niezbędnym do świadczenia usługi.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2 uppercase tracking-wide">Charakter serwisu</h2>
            <p>
              SlamSlot jest niekomercyjnym narzędziem stworzonym dla środowiska slam poetyckiego
              w Polsce. Serwis nie pobiera opłat, nie wyświetla reklam i nie przetwarza danych
              w celach komercyjnych.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2a2a2a]">
          <p className="text-xs text-[#444]">Ostatnia aktualizacja: marzec 2026</p>
          <Link href="/" className="text-xs text-[#c0392b] hover:underline mt-2 inline-block">
            ← Wróć do SlamSlot
          </Link>
        </div>
      </div>
    </main>
  )
}
