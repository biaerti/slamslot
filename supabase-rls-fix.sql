-- ============================================================
-- Wlaczenie RLS + odciecie anon/authenticated
-- Uruchom w: Supabase Dashboard -> SQL Editor
--
-- Aplikacja laczy sie wylacznie kluczem service_role (lib/supabase.ts),
-- a service_role omija RLS. Wiec wlaczenie RLS BEZ zadnych polityk
-- niczego w apce nie psuje, a blokuje caly dostep przez publiczne
-- REST/GraphQL API dla kluczy anon/publishable.
-- ============================================================

-- 0) SPRAWDZENIE STANU (odpal najpierw, zeby zobaczyc jak jest teraz)
SELECT c.relname AS tabela,
       c.relrowsecurity AS rls_wlaczone,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_moze_czytac,
       has_table_privilege('anon', c.oid, 'INSERT') AS anon_moze_pisac
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r';

-- 1) Wlacz RLS (bez polityk = deny all dla anon/authenticated)
ALTER TABLE public.slams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 2) Druga warstwa: zabierz uprawnienia rolom publicznym
REVOKE ALL ON public.slams FROM anon, authenticated;
REVOKE ALL ON public.registrations FROM anon, authenticated;

-- 3) Funkcja RPC register_participant jest wystawiona pod /rest/v1/rpc/...
--    Apka wola ja kluczem service_role, wiec anon nie potrzebuje EXECUTE.
REVOKE EXECUTE ON FUNCTION public.register_participant(uuid, text, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant(uuid, text, text, text, text, text, text)
  TO service_role;

-- 4) Nowe tabele/funkcje w public nie dostana automatycznie grantow dla anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;

-- 5) Storage: bucket slam-images jest publiczny (obrazki po URL - OK),
--    ale nie powinno byc polityki pozwalajacej anon LISTOWAC/wgrywac pliki.
--    Sprawdz, czy nic tu nie wyjdzie:
SELECT policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 6) Weryfikacja - po wszystkim odpal ponownie zapytanie z punktu 0.
--    Oczekiwane: rls_wlaczone = true, anon_moze_czytac = false, anon_moze_pisac = false.
