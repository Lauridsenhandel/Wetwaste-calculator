-- =========================================================
-- FIX: Enable pgcrypto extension
-- Denne extension kræves for at funktionen gen_random_bytes() virker.
-- =========================================================

create extension if not exists pgcrypto schema public;

-- Dobbelttjek at funktionen generator virker
create or replace function public.generate_share_token()
returns text
language sql
as $$
  select encode(public.gen_random_bytes(18), 'base64url');
$$;
