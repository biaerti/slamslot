import { Suspense } from 'react'
import RegisteredContent from './registered-content'

export default function RegisteredPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <RegisteredContent />
    </Suspense>
  )
}
