-- ============================================================
-- Schemat bazy danych dla aplikacji do zapisów na slamy
-- Uruchom w: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabela slamów
CREATE TABLE IF NOT EXISTS slams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_name   text NOT NULL,
  name             text NOT NULL,
  description      text,
  event_date       timestamptz NOT NULL,
  max_participants integer NOT NULL CHECK (max_participants > 0),
  organizer_token  text NOT NULL UNIQUE,
  organizer_email  text,           -- email organizatora (do wysłania linków)
  fb_event_url     text,           -- link do wydarzenia na Facebooku
  image_url        text,           -- URL zdjęcia (wgrywane do Supabase Storage)
  dashboard_password_hash text,   -- opcjonalne hasło do dashboardu (sól:hash)
  organizer_message text,         -- opcjonalna wiadomość od organizatora (pojawia się w mailach)
  location         text,           -- lokalizacja / link do Google Maps
  show_spots       boolean NOT NULL DEFAULT true, -- czy pokazywać liczbę wolnych miejsc
  password_reset_token text,                     -- token do resetu hasła
  password_reset_expires timestamptz,            -- wygaśnięcie tokenu resetu
  reminder_days_before integer CHECK (reminder_days_before IN (1, 2)), -- ile dni przed eventem wysłać przypomnienie
  reminder_message text,                         -- opcjonalna wiadomość w przypomnieniu
  reminder_sent_at timestamptz,                  -- kiedy wysłano przypomnienie (null = jeszcze nie)
  created_at       timestamptz DEFAULT now()
);

-- Tabela zapisów
CREATE TABLE IF NOT EXISTS registrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slam_id               uuid NOT NULL REFERENCES slams(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  nickname              text,           -- ksywka / pseudonim
  email                 text NOT NULL,
  phone                 text,
  note                  text,
  status                text NOT NULL CHECK (status IN ('confirmed', 'waiting', 'cancelled')),
  position              integer NOT NULL,
  waitlist_check_token  text NOT NULL UNIQUE,
  cancel_token          text UNIQUE,    -- token do anulowania przez link w mailu
  cancelled_by          text CHECK (cancelled_by IN ('manual', 'email_link')),
  registered_at         timestamptz DEFAULT now(),
  UNIQUE(slam_id, email)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_registrations_slam_status_pos
  ON registrations(slam_id, status, position);

-- ============================================================
-- RPC: Atomiczna rejestracja uczestnika (zapobiega race condition)
-- ============================================================
CREATE OR REPLACE FUNCTION register_participant(
  p_slam_id        uuid,
  p_name           text,
  p_email          text,
  p_phone          text,
  p_note           text,
  p_waitlist_token text,
  p_cancel_token   text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_participants integer;
  v_confirmed_count  integer;
  v_waiting_count    integer;
  v_status           text;
  v_position         integer;
  v_reg_id           uuid;
BEGIN
  SELECT max_participants INTO v_max_participants
  FROM slams
  WHERE id = p_slam_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slam not found';
  END IF;

  SELECT COUNT(*) INTO v_confirmed_count
  FROM registrations
  WHERE slam_id = p_slam_id AND status = 'confirmed';

  SELECT COUNT(*) INTO v_waiting_count
  FROM registrations
  WHERE slam_id = p_slam_id AND status = 'waiting';

  IF v_confirmed_count < v_max_participants THEN
    v_status   := 'confirmed';
    v_position := v_confirmed_count + 1;
  ELSE
    v_status   := 'waiting';
    v_position := v_waiting_count + 1;
  END IF;

  INSERT INTO registrations (slam_id, name, email, phone, note, status, position, waitlist_check_token, cancel_token)
  VALUES (p_slam_id, p_name, p_email, p_phone, p_note, v_status, v_position, p_waitlist_token, p_cancel_token)
  RETURNING id INTO v_reg_id;

  RETURN json_build_object(
    'id',              v_reg_id,
    'status',          v_status,
    'position',        v_position,
    'waitlist_token',  p_waitlist_token
  );
END;
$$;

-- ============================================================
-- Supabase Storage bucket na zdjęcia wydarzeń (uruchom raz)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('slam-images', 'slam-images', true)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- Row Level Security (wyłączone — dostęp tylko przez service role)
-- ============================================================
ALTER TABLE slams DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Migracja dla istniejących tabel (jeśli już masz dane)
-- ============================================================
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS organizer_email text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS fb_event_url text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS image_url text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS nickname text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS organizer_name text NOT NULL DEFAULT '';
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS dashboard_password_hash text;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cancel_token text UNIQUE;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cancelled_by text CHECK (cancelled_by IN ('manual', 'email_link'));
-- ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
-- ALTER TABLE registrations ADD CONSTRAINT registrations_status_check CHECK (status IN ('confirmed', 'waiting', 'cancelled'));
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS organizer_message text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS location text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS show_spots boolean NOT NULL DEFAULT true;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS password_reset_token text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS reminder_days_before integer CHECK (reminder_days_before IN (1, 2));
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS reminder_message text;
-- ALTER TABLE slams ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
-- ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attendance_confirmed boolean;
