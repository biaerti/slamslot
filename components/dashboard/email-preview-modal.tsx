'use client'

interface EmailPreviewModalProps {
  slamName: string
  slamDate: string
  organizerMessage: string
  onClose: () => void
}

export default function EmailPreviewModal({
  slamName,
  slamDate,
  organizerMessage,
  onClose,
}: EmailPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-[#2a2a2a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
          <p className="text-xs font-bold text-[#555] uppercase tracking-widest">
            Podgląd maila — potwierdzenie zapisu
          </p>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-[#aaa] text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Email preview */}
        <div className="p-6" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Slam name header */}
          <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: 4, margin: '0 0 16px', textTransform: 'uppercase' }}>
            {slamName}
          </p>
          <hr style={{ borderColor: '#333', margin: '0 0 16px' }} />

          <p style={{ color: '#c0392b', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
            Jesteś na liście! ✓
          </p>
          <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: '24px', margin: '0 0 8px' }}>
            Cześć <strong>Jan Kowalski</strong>,
          </p>
          <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: '24px', margin: '0 0 16px' }}>
            Twój zapis na <strong>{slamName}</strong> został potwierdzony.
            Jesteś na pozycji <strong>#1</strong> na liście uczestników.
          </p>

          {/* Info box */}
          <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderLeft: '4px solid #c0392b', padding: '16px 20px', margin: '0 0 16px' }}>
            <p style={{ color: '#e0e0e0', fontSize: 15, margin: '0 0 6px' }}><strong>Wydarzenie:</strong> {slamName}</p>
            <p style={{ color: '#e0e0e0', fontSize: 15, margin: '0 0 6px' }}><strong>Data:</strong> {slamDate}</p>
            <p style={{ color: '#e0e0e0', fontSize: 15, margin: 0 }}><strong>Twoja pozycja:</strong> #1</p>
          </div>

          {/* Organizer message */}
          {organizerMessage ? (
            <div style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', borderLeft: '4px solid #555', padding: '12px 16px', margin: '0 0 16px' }}>
              <p style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>
                Od organizatora:
              </p>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: '22px', margin: 0 }}>
                {organizerMessage}
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#111', border: '1px dashed #2a2a2a', padding: '12px 16px', margin: '0 0 16px' }}>
              <p style={{ color: '#3a3a3a', fontSize: 13, margin: 0, fontStyle: 'italic' }}>
                Tu pojawi się Twoja wiadomość od organizatora (jeśli wpiszesz coś powyżej).
              </p>
            </div>
          )}

          {/* Cancel link */}
          <p style={{ color: '#888', fontSize: 13, lineHeight: '20px', margin: '0 0 16px' }}>
            Nie możesz przyjść?{' '}
            <span style={{ color: '#c0392b', textDecoration: 'underline' }}>
              Kliknij tutaj, żeby anulować zapis
            </span>
            {' '}— zwolnisz miejsce dla kolejnej osoby.
          </p>

          <hr style={{ borderColor: '#333', margin: '0 0 16px' }} />
          <p style={{ color: '#666', fontSize: 13, margin: 0 }}>Do zobaczenia na slamie!</p>
        </div>

        <div className="px-5 py-3 border-t border-[#2a2a2a]">
          <p className="text-xs text-[#3a3a3a]">
            To jest podgląd — rzeczywisty mail może nieznacznie różnić się wyglądem w zależności od klienta pocztowego.
          </p>
        </div>
      </div>
    </div>
  )
}
