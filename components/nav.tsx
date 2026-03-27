'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NavProps {
  active?: 'o-slamie' | 'nadchodzace-slamy' | 'stworz-slam' | 'o-projekcie'
}

export default function Nav({ active }: NavProps) {
  const [open, setOpen] = useState(false)

  const linkClass = (key: typeof active) =>
    active === key
      ? 'text-white font-semibold'
      : 'text-[#888] hover:text-white transition-colors'

  const links = [
    { href: '/nadchodzace-slamy', label: 'Nadchodzące slamy', key: 'nadchodzace-slamy' as const },
    { href: '/o-slamie', label: 'O slamie', key: 'o-slamie' as const },
    { href: '/o-projekcie', label: 'O projekcie', key: 'o-projekcie' as const },
    { href: '/', label: 'Stwórz slam', key: 'stworz-slam' as const },
  ]

  return (
    <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between relative">
      <Link
        href="/"
        className="font-display text-2xl tracking-widest text-white hover:text-[#c0392b] transition-colors"
      >
        SLAMSLOT
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-6 text-sm">
        {links.map(({ href, label, key }) => (
          <Link key={key} href={href} className={linkClass(key)}>{label}</Link>
        ))}
      </nav>

      {/* Hamburger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex flex-col gap-1.5 p-1 text-[#888] hover:text-white transition-colors"
        aria-label="Menu"
      >
        <span className={`block w-5 h-px bg-current transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-5 h-px bg-current transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-5 h-px bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0d0d0d] border-b border-[#2a2a2a] z-50 py-2">
          {links.map(({ href, label, key }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm ${linkClass(key)}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
