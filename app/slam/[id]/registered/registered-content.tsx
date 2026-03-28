'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/nav'

export default function RegisteredContent() {
  const params = useSearchParams()
  const status = params.get('status') as 'confirmed' | 'waiting' | null
  const position = params.get('position')
  const name = params.get('name') ?? 'Uczestnik'

  const isConfirmed = status === 'confirmed'

  return (
    <main className="min-h-screen flex flex-col">
      <Nav />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full text-center">
          <div
            className={`inline-block w-16 h-16 mb-8 border-2 ${
              isConfirmed ? 'border-[#c0392b]' : 'border-yellow-500'
            } flex items-center justify-center mx-auto`}
          >
            <span className="text-2xl">{isConfirmed ? '✓' : '⧗'}</span>
          </div>

          <h1 className="font-display text-5xl text-white leading-none mb-4">
            {isConfirmed ? 'JESTEŚ ZAPISANY/A!' : 'LISTA REZERWOWA'}
          </h1>

          <p className="text-[#aaa] text-lg mt-4 leading-relaxed">
            {isConfirmed ? (
              <>
                Cześć <strong className="text-white">{name}</strong>! Twoje miejsce jest
                potwierdzone — jesteś na pozycji{' '}
                <strong className="text-[#c0392b]">#{position}</strong> na liście.
              </>
            ) : (
              <>
                Cześć <strong className="text-white">{name}</strong>! Zapisałeś/łaś się na listę
                rezerwową — jesteś na pozycji{' '}
                <strong className="text-yellow-400">#{position}</strong>.
                Dostaniesz maila jeśli zwolni się miejsce.
              </>
            )}
          </p>

          <div className="mt-8 bg-[#141414] border border-[#2a2a2a] p-6 text-left">
            <p className="text-xs font-bold text-[#aaa] uppercase tracking-wider mb-3">
              Co dalej?
            </p>
            <ul className="space-y-2 text-sm text-[#aaa]">
              <li className="flex gap-2">
                <span className="text-[#c0392b]">→</span>
                Sprawdź skrzynkę email — wysłaliśmy potwierdzenie
              </li>
              <li className="flex gap-2">
                <span className="text-[#555]">→</span>
                <span className="text-[#666]">Nie ma maila? Sprawdź folder spam</span>
              </li>
              {!isConfirmed && (
                <li className="flex gap-2">
                  <span className="text-yellow-500">→</span>
                  Kliknij link w mailu żeby sprawdzać swoją pozycję na bieżąco
                </li>
              )}
              <li className="flex gap-2">
                <span className="text-[#c0392b]">→</span>
                Jeśli chcesz zrezygnować, odpowiedz na maila z potwierdzeniem
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-block mt-8 text-sm text-[#555] hover:text-[#aaa] transition-colors"
          >
            ← Strona główna
          </Link>
        </div>
      </div>
    </main>
  )
}
