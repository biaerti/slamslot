import Nav from '@/components/nav'
import Link from 'next/link'

const FB_POST_URL =
  'https://www.facebook.com/slamartpl/posts/pfbid02UoF1VKkjG3GGHjFLd2RY5F1ArAGN7Cc2CgCTHr4ipco5LJFgxqbHmofspahpGTJol?locale=pl_PL'

export default function OSlamiePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Nav active="o-slamie" />

      <div className="max-w-4xl mx-auto px-6 py-16 w-full">

        <section>
          <p className="text-xs font-bold text-[#c0392b] uppercase tracking-widest mb-4">Czym jest</p>
          <h1 className="font-display text-6xl text-white leading-none mb-8">
            SLAM<br />POETYCKI
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#aaa] leading-relaxed">
            <div>
              <p>
                <strong className="text-white">Slam poetycki</strong> to otwarta scena i turniej
                poetycki — spoken-wordowy, performerski — na którym każdy może wystąpić.
                Wystarczy zgłosić się zanim zajmą się wszystkie miejsca.
              </p>
              <p className="mt-4">
                Każdy uczestnik ma <strong className="text-white">3 minuty</strong>. Prezentuje
                własny tekst w dowolnej formie — z kartki, telefonu, z pamięci, improwizując.{' '}
                <strong className="text-white">Bez rekwizytów i muzyki.</strong>
              </p>
              <p className="mt-4">
                Wieczór składa się zazwyczaj z trzech części: runda główna, półfinał i finał.
                O tym, kto przechodzi dalej,{' '}
                <strong className="text-white">decyduje publiczność</strong> — to nieodłączna
                reguła gry.
              </p>
            </div>
            <div>
              <p>
                Slamy odbywają się w całej Polsce — w klubach, kawiarniach, bibliotekach
                i teatrach. Każdy jest inny, każdy ma swój klimat. Warto przyjść choćby jako widz.
              </p>
              <p className="mt-4">
                Ogólnopolska społeczność slamowa skupiona jest wokół portalu{' '}
                <strong className="text-white">SLAM.ART.PL</strong> —
                największego polskiego serwisu o poezji slamu.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="https://www.facebook.com/slamartpl/?locale=pl_PL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white px-4 py-2 text-sm font-bold tracking-wide transition-colors"
                >
                  SLAM.ART.PL na Facebooku →
                </a>
                <Link
                  href="/nadchodzace-slamy"
                  className="inline-block border border-[#2a2a2a] text-[#888] hover:border-[#c0392b] hover:text-[#c0392b] px-4 py-2 text-sm font-bold tracking-wide transition-colors"
                >
                  Nadchodzące slamy w Polsce →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA do stworzenia slamu */}
        <section className="mt-20 border-t border-[#2a2a2a] pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="font-display text-3xl text-white">ORGANIZUJESZ SLAM?</p>
              <p className="text-[#888] text-sm mt-1">
                Stwórz formularz zapisów w kilka sekund i wrzuć link na Facebooka.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold px-8 py-3 text-sm tracking-wide transition-colors"
            >
              Stwórz slam →
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
