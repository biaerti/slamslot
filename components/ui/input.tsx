'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const baseClass =
  'w-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] placeholder-[#555] px-4 py-2 focus:outline-none focus:border-[#c0392b] transition-colors'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#aaa] uppercase tracking-wider mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </label>
      )}
      <input ref={ref} className={`${baseClass} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#aaa] uppercase tracking-wider mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </label>
      )}
      <textarea ref={ref} className={`${baseClass} resize-none ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
