import Nav from '@/components/nav'
import { fetchUpcomingSlams } from '@/lib/upcoming-slams'
import NadchodzaceSlamyClient from './client'

export const revalidate = 3600

const FB_POST_URL =
  'https://www.facebook.com/slamartpl/posts/pfbid02UoF1VKkjG3GGHjFLd2RY5F1ArAGN7Cc2CgCTHr4ipco5LJFgxqbHmofspahpGTJol?locale=pl_PL'

export default async function NadchodzaceSlamyPage() {
  const slams = await fetchUpcomingSlams()

  return (
    <main className="min-h-screen flex flex-col">
      <Nav active="nadchodzace-slamy" />
      <NadchodzaceSlamyClient slams={slams} fbPostUrl={FB_POST_URL} />
    </main>
  )
}
