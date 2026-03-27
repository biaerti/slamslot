import Link from 'next/link'

interface NavProps {
  active?: 'o-slamie' | 'nadchodzace-slamy' | 'stworz-slam' | 'o-projekcie'
}

export default function Nav({ active }: NavProps) {
  const link = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      className={
        active === key
          ? 'text-white font-semibold'
          : 'text-[#888] hover:text-white transition-colors'
      }
    >
      {label}
    </Link>
  )

  return (
    <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
      <Link
        href="/"
        className="font-display text-2xl tracking-widest text-white hover:text-[#c0392b] transition-colors"
      >
        SLAMSLOT
      </Link>
      <nav className="flex gap-6 text-sm">
        {link('/nadchodzace-slamy', 'Nadchodzące slamy', 'nadchodzace-slamy')}
        {link('/o-slamie', 'O slamie', 'o-slamie')}
        {link('/o-projekcie', 'O projekcie', 'o-projekcie')}
        <Link
          href="/"
          className={
            active === 'stworz-slam'
              ? 'text-white font-semibold'
              : 'text-[#888] hover:text-white transition-colors'
          }
        >
          Stwórz slam
        </Link>
      </nav>
    </header>
  )
}
