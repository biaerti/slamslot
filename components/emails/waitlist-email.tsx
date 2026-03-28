import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Button,
} from '@react-email/components'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface WaitlistEmailProps {
  participantName: string
  slamName: string
  slamDate: string
  position: number
  checkPositionUrl: string
  organizerMessage?: string
}

export default function WaitlistEmail({
  participantName,
  slamName,
  slamDate,
  position,
  checkPositionUrl,
  organizerMessage,
}: WaitlistEmailProps) {
  const formattedDate = format(new Date(slamDate.replace(' ', 'T')), "d MMMM yyyy, HH:mm", { locale: pl })

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{slamName.toUpperCase()}</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>
            Jesteś na liście rezerwowej
          </Heading>
          <Text style={text}>Cześć {participantName},</Text>
          <Text style={text}>
            Zapisałeś/łaś się na <strong>{slamName}</strong>, ale wszystkie miejsca są
            już zajęte. Jesteś na pozycji <strong>#{position}</strong> na liście rezerwowej.
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Wydarzenie:</strong> {slamName}
            </Text>
            <Text style={infoText}>
              <strong>Data:</strong> {formattedDate}
            </Text>
            <Text style={infoText}>
              <strong>Pozycja na liście rez.:</strong> #{position}
            </Text>
          </Section>
          {organizerMessage && (
            <Section style={organizerBox}>
              <Text style={organizerLabel}>Od organizatora:</Text>
              <Text style={organizerText}>{organizerMessage}</Text>
            </Section>
          )}
          <Text style={text}>
            Sprawdzaj swoją aktualną pozycję klikając poniższy przycisk.
            Jeśli zwolni się miejsce, przesuniemy Cię automatycznie na listę główną
            i dostaniesz od nas maila.
          </Text>
          <Button href={checkPositionUrl} style={button}>
            Sprawdź swoją pozycję
          </Button>
          <Hr style={hr} />
          <Text style={footer}>Trzymaj się — może się uda!</Text>
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
  color: '#f1c40f',
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
  borderLeft: '4px solid #f1c40f',
  padding: '16px 20px',
  margin: '20px 0',
}

const infoText = {
  color: '#e0e0e0',
  fontSize: '15px',
  margin: '6px 0',
}

const button = {
  backgroundColor: '#f1c40f',
  color: '#0a0a0a',
  fontWeight: '700',
  fontSize: '15px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '16px 0',
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

const organizerBox = { backgroundColor: '#111', border: '1px solid #2a2a2a', borderLeft: '4px solid #555', padding: '12px 16px', margin: '20px 0' }
const organizerLabel = { color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 6px' }
const organizerText = { color: '#ccc', fontSize: '14px', lineHeight: '22px', margin: '0' }
