import { Html, Head, Body, Container, Heading, Text, Hr, Button } from '@react-email/components'

interface ResetPasswordEmailProps {
  slamName: string
  resetUrl: string
}

export default function ResetPasswordEmail({ slamName, resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>SLAMSLOT</Heading>
          <Hr style={hr} />
          <Text style={text}>
            Otrzymaliśmy prośbę o reset hasła do dashboardu slamu <strong>{slamName}</strong>.
          </Text>
          <Text style={text}>
            Kliknij przycisk poniżej, żeby ustawić nowe hasło. Link jest ważny przez 1 godzinę.
          </Text>
          <Button href={resetUrl} style={btn}>Ustaw nowe hasło</Button>
          <Text style={small}>
            Jeśli nie prosiłeś/aś o reset hasła, zignoruj tego maila.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>SlamSlot</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#0a0a0a', fontFamily: 'Arial, sans-serif' }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }
const heading = { color: '#ffffff', fontSize: '28px', fontWeight: '900', letterSpacing: '4px', margin: '0 0 20px' }
const text = { color: '#e0e0e0', fontSize: '16px', lineHeight: '24px', margin: '12px 0' }
const btn = { backgroundColor: '#c0392b', color: '#fff', fontWeight: '700', fontSize: '14px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }
const small = { color: '#666', fontSize: '12px', margin: '20px 0 0' }
const hr = { borderColor: '#333', margin: '20px 0' }
const footer = { color: '#666', fontSize: '13px', margin: '0' }
