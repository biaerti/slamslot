import {
  Html, Head, Body, Container, Heading, Text, Hr, Section, Button,
} from '@react-email/components'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'

interface OrganizerEmailProps {
  slamName: string
  slamDate: string
  publicUrl: string
  dashboardUrl: string
}

export default function OrganizerEmail({ slamName, slamDate, publicUrl, dashboardUrl }: OrganizerEmailProps) {
  const formattedDate = format(new Date(slamDate.replace(' ', 'T')), "d MMMM yyyy, HH:mm", { locale: pl })

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>SLAMSLOT</Heading>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>Slam stworzony!</Heading>
          <Text style={text}>
            Slam <strong>{slamName}</strong> ({formattedDate}) jest gotowy.
            Poniżej znajdziesz oba linki — zachowaj tego maila.
          </Text>

          <Section style={box}>
            <Text style={label}>Link dla uczestników (wrzuć na FB)</Text>
            <Text style={url}>{publicUrl}</Text>
            <Button href={publicUrl} style={btnSecondary}>Otwórz stronę zapisów</Button>
          </Section>

          <Section style={{ ...box, borderLeftColor: '#c0392b' }}>
            <Text style={{ ...label, color: '#c0392b' }}>Link do dashboardu (tylko dla Ciebie!)</Text>
            <Text style={url}>{dashboardUrl}</Text>
            <Button href={dashboardUrl} style={btnPrimary}>Otwórz dashboard</Button>
          </Section>

          <Text style={small}>
            Nie udostępniaj linku do dashboardu nikomu innemu — daje pełny dostęp do zarządzania listą.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>Powodzenia na slamie!</Text>
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
const box = { backgroundColor: '#1a1a1a', border: '1px solid #333', borderLeft: '4px solid #f1c40f', padding: '16px 20px', margin: '16px 0' }
const label = { color: '#aaa', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 6px' }
const url = { color: '#f0f0f0', fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all' as const, margin: '0 0 12px' }
const btnPrimary = { backgroundColor: '#c0392b', color: '#fff', fontWeight: '700', fontSize: '14px', padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }
const btnSecondary = { backgroundColor: '#f1c40f', color: '#0a0a0a', fontWeight: '700', fontSize: '14px', padding: '10px 20px', textDecoration: 'none', display: 'inline-block' }
const small = { color: '#666', fontSize: '12px', margin: '16px 0 0' }
const hr = { borderColor: '#333', margin: '20px 0' }
const footer = { color: '#666', fontSize: '13px', margin: '0' }
