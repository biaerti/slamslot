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
  Button,
} from '@react-email/components'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ReminderEmailProps {
  participantName: string
  slamName: string
  slamDate: string
  confirmUrl: string
  cancelUrl?: string
  organizerMessage?: string
  organizerEmail?: string
  reminderMessage?: string
}

export default function ReminderEmail({
  participantName,
  slamName,
  slamDate,
  confirmUrl,
  cancelUrl,
  organizerMessage,
  organizerEmail,
  reminderMessage,
}: ReminderEmailProps) {
  const formattedDate = format(new Date(slamDate.replace(' ', 'T')), "d MMMM yyyy, HH:mm", { locale: pl })

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{slamName.toUpperCase()}</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>
            Przypomnienie o slamie ⏰
          </Heading>
          <Text style={text}>Cześć {participantName},</Text>
          <Text style={text}>
            Przypominamy, że jutro odbędzie się <strong>{slamName}</strong>!
            Czekamy na Ciebie.
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Wydarzenie:</strong> {slamName}
            </Text>
            <Text style={infoText}>
              <strong>Data:</strong> {formattedDate}
            </Text>
          </Section>

          {reminderMessage && (
            <Section style={reminderBox}>
              <Text style={organizerLabel}>Od organizatora:</Text>
              <Text style={organizerText}>{reminderMessage}</Text>
            </Section>
          )}

          {organizerMessage && !reminderMessage && (
            <Section style={organizerBox}>
              <Text style={organizerLabel}>Od organizatora:</Text>
              <Text style={organizerText}>{organizerMessage}</Text>
            </Section>
          )}

          <Text style={text}>Czy możesz przyjść?</Text>

          <Section style={buttonRow}>
            <Link href={confirmUrl} style={confirmButton}>
              ✓ Potwierdzam uczestnictwo
            </Link>
            {cancelUrl && (
              <Link href={cancelUrl} style={cancelButton}>
                ✗ Rezygnuję
              </Link>
            )}
          </Section>

          {organizerEmail && (
            <Text style={contactText}>
              Masz pytania? Napisz do organizatora:{' '}
              <Link href={`mailto:${organizerEmail}`} style={link}>
                {organizerEmail}
              </Link>
            </Text>
          )}

          <Hr style={hr} />
          <Text style={footer}>Do zobaczenia na slamie!</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#0a0a0a',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 20px',
}

const heading = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '900',
  letterSpacing: '4px',
  margin: '0 0 20px',
}

const subheading = {
  color: '#c0392b',
  fontSize: '22px',
  fontWeight: '700',
  margin: '20px 0',
}

const text = {
  color: '#e0e0e0',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
}

const infoBox = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #333',
  borderLeft: '4px solid #c0392b',
  padding: '16px 20px',
  margin: '20px 0',
}

const infoText = {
  color: '#e0e0e0',
  fontSize: '15px',
  margin: '6px 0',
}

const hr = {
  borderColor: '#333',
  margin: '20px 0',
}

const footer = {
  color: '#666',
  fontSize: '13px',
  margin: '0',
}

const contactText = {
  color: '#888',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '12px 0 0',
}

const link = {
  color: '#c0392b',
  textDecoration: 'underline',
}

const buttonRow = {
  margin: '20px 0',
  display: 'flex' as const,
  gap: '12px',
}

const confirmButton = {
  display: 'inline-block',
  backgroundColor: '#c0392b',
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '14px',
  padding: '12px 24px',
  textDecoration: 'none',
  marginRight: '12px',
}

const cancelButton = {
  display: 'inline-block',
  backgroundColor: '#1a1a1a',
  color: '#888',
  fontWeight: '700',
  fontSize: '14px',
  padding: '12px 24px',
  textDecoration: 'none',
  border: '1px solid #333',
}

const organizerBox = {
  backgroundColor: '#111',
  border: '1px solid #2a2a2a',
  borderLeft: '4px solid #555',
  padding: '12px 16px',
  margin: '20px 0',
}

const reminderBox = {
  backgroundColor: '#111',
  border: '1px solid #2a2a2a',
  borderLeft: '4px solid #c0392b',
  padding: '12px 16px',
  margin: '20px 0',
}

const organizerLabel = {
  color: '#888',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 6px',
}

const organizerText = {
  color: '#ccc',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}
