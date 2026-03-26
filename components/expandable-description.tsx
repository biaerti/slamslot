'use client'

import { useState } from 'react'

export default function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 200

  return (
    <div className="mb-8 max-w-md">
      <p className={`text-[#aaa] text-base leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
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
