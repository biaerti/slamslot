'use client'

import { useState, useRef, useEffect } from 'react'

export default function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isLong = text.length > 180

  useEffect(() => {
    if (!expanded) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [expanded])

  return (
    <div className="relative mb-8 max-w-md" ref={ref}>
      <p className="text-[#aaa] text-base leading-relaxed line-clamp-2">
        {text}
      </p>
      {isLong && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1 text-xs text-[#555] hover:text-[#aaa] transition-colors"
        >
          ↓ Rozwiń
        </button>
      )}
      {expanded && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-[#0d0d0d] border border-[#2a2a2a] p-4 shadow-xl">
          <p className="text-[#aaa] text-base leading-relaxed">{text}</p>
          <button
            onClick={() => setExpanded(false)}
            className="mt-2 text-xs text-[#555] hover:text-[#aaa] transition-colors"
          >
            ↑ Zwiń
          </button>
        </div>
      )}
    </div>
  )
}
