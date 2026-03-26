export interface Slam {
  id: string
  organizer_name: string
  name: string
  description: string | null
  event_date: string
  max_participants: number
  organizer_token: string
  fb_event_url: string | null
  image_url: string | null
  location: string | null
  organizer_email: string | null
  dashboard_password_hash: string | null
  organizer_message: string | null
  created_at: string
}

export interface Registration {
  id: string
  slam_id: string
  name: string
  nickname: string | null
  email: string
  phone: string | null
  note: string | null
  status: 'confirmed' | 'waiting' | 'cancelled'
  position: number
  waitlist_check_token: string
  cancel_token: string | null
  cancelled_by: 'manual' | 'email_link' | null
  registered_at: string
}

export interface SlamPublic {
  id: string
  organizer_name: string
  name: string
  description: string | null
  event_date: string
  max_participants: number
  confirmed_count: number
  waiting_count: number
  image_url: string | null
  location: string | null
}

export interface DashboardData {
  slam: Slam
  confirmed: Registration[]
  waiting: Registration[]
  cancelled: Registration[]
}

export interface WaitlistData {
  name_initial: string
  position: number
  slam_name: string
  slam_date: string
}
