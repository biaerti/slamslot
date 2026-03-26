'use client'

import { useState } from 'react'

export default function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 180

  return (
    <div className="mb-6 max-w-md">
      <div
        className={`text-[#aaa] text-base leading-relaxed overflow-y-auto transition-all ${
          expanded ? 'max-h-48' : 'max-h-[4.5rem] overflow-hidden'
        }`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
      >
        {text}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-[#555] hover:text-[#aaa] transition-colors"
        >
          {expanded ? '↑ Zwiń' : '↓ Rozwiń'}
        </button>
      )}
    </div>
  )
}
