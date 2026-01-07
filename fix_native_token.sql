-- =========================================================
-- FIX: Native Random Token (Ingen extensions nødvendige)
-- Denne virker 100% uden pgcrypto cludret.
-- =========================================================

create or replace function public.generate_share_token()
returns text
language sql
as $$
  select array_to_string(array(
      select substr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', ((random()*(62-1)+1)::integer), 1)
      from generate_series(1, 18)
  ), '');
$$;
