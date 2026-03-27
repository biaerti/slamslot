import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Link,
} from '@react-email/components'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface PromotedEmailProps {
  participantName: string
  slamName: string
  slamDate: string
  position: number
  cancelUrl?: string
  organizerMessage?: string
}

export default function PromotedEmail({
  participantName,
  slamName,
  slamDate,
  position,
  cancelUrl,
  organizerMessage,
}: PromotedEmailProps) {
  const formattedDate = format(new Date(slamDate.replace(' ', 'T')), "d MMMM yyyy, HH:mm", { locale: pl })

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{slamName.toUpperCase()}</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>
            Dostałeś/łaś się! 🎉
          </Heading>
          <Text style={text}>Cześć {participantName},</Text>
          <Text style={text}>
            Mamy świetne wiadomości! Zwolniło się miejsce i zostałeś/łaś przeniesiony/a
            z listy rezerwowej na <strong>listę główną</strong> slamu{' '}
            <strong>{slamName}</strong>!
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Wydarzenie:</strong> {slamName}
            </Text>
            <Text style={infoText}>
              <strong>Data:</strong> {formattedDate}
            </Text>
            <Text style={infoText}>
              <strong>Twoja pozycja:</strong> #{position}
            </Text>
          </Section>
          {cancelUrl ? (
            <Text style={cancelText}>
              Nie możesz przyjść?{' '}
              <Link href={cancelUrl} style={cancelLink}>
                Kliknij tutaj, żeby anulować zapis
              </Link>
              {' '}— zwolnisz miejsce dla kolejnej osoby.
            </Text>
          ) : (
            <Text style={cancelText}>
              Jeśli jednak nie możesz wziąć udziału, napisz do organizatora,
              żeby zwolnić miejsce dla kolejnej osoby z listy rezerwowej.
            </Text>
          )}
          {organizerMessage && (
            <Section style={organizerBox}>
              <Text style={organizerLabel}>Od organizatora:</Text>
              <Text style={organizerText}>{organizerMessage}</Text>
            </Section>
          )}
          <Hr style={hr} />
          <Text style={footer}>Do zobaczenia na slamie!</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#0a0a0a', fontFamily: 'Arial, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const heading = { color: '#ffffff', fontSize: '28px', fontWeight: '900', letterSpacing: '4px', margin: '0 0 20px' }
const subheading = { color: '#c0392b', fontSize: '22px', fontWeight: '700', margin: '20px 0' }
const text = { color: '#e0e0e0', fontSize: '16px', lineHeight: '24px', margin: '12px 0' }
const infoBox = { backgroundColor: '#1a1a1a', border: '1px solid #333', borderLeft: '4px solid #c0392b', padding: '16px 20px', margin: '20px 0' }
const infoText = { color: '#e0e0e0', fontSize: '15px', margin: '6px 0' }
const hr = { borderColor: '#333', margin: '20px 0' }
const footer = { color: '#666', fontSize: '13px', margin: '0' }
const cancelText = { color: '#888', fontSize: '13px', lineHeight: '20px', margin: '16px 0 0' }
const cancelLink = { color: '#c0392b', textDecoration: 'underline' }
const organizerBox = { backgroundColor: '#111', border: '1px solid #2a2a2a', borderLeft: '4px solid #555', padding: '12px 16px', margin: '20px 0' }
const organizerLabel = { color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 6px' }
const organizerText = { color: '#ccc', fontSize: '14px', lineHeight: '22px', margin: '0' }
