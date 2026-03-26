interface BadgeProps {
  children: React.ReactNode
  variant?: 'confirmed' | 'waiting'
}

export function Badge({ children, variant = 'confirmed' }: BadgeProps) {
  const classes =
    variant === 'confirmed'
      ? 'bg-green-900/50 text-green-400 border border-green-800'
      : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800'

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${classes}`}>
      {children}
    </span>
  )
}
