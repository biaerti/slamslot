'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantClasses = {
  primary: 'bg-[#c0392b] hover:bg-[#a93226] text-white',
  secondary: 'bg-[#f1c40f] hover:bg-[#d4ac0d] text-[#0a0a0a]',
  danger: 'bg-transparent border border-red-700 hover:bg-red-900/20 text-red-400',
  ghost: 'bg-transparent hover:bg-white/5 text-[#f0f0f0]',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'font-bold tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? 'Ładowanie...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
