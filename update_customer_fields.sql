-- =========================================================
-- UPDATE: Add Customer Contact Fields
-- 1. Tilføjer kolonner til cases tabellen
-- 2. Opdaterer create_case_anon funktionen
-- =========================================================

-- 1. Tilføj kolonner
alter table public.cases 
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

-- 2. Opdater RPC funktionen (Drop den gamle først for at undgå dubletter med færre argumenter)
drop function if exists public.create_case_anon(
  text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
);

create or replace function public.create_case_anon(
  p_seller_name text,
  p_company_name text,
  p_address text,
  p_contact_name text,   -- NY
  p_contact_email text,  -- NY
  p_contact_phone text,  -- NY
  p_inputs jsonb,
  p_outputs jsonb,
  p_current_annual_cost_dkk numeric,
  p_investment_dkk numeric,
  p_new_annual_cost_dkk numeric,
  p_break_even_years numeric,
  p_horizon_years int
)
returns table (
  case_id uuid,
  share_token text,
  share_enabled boolean,
  share_expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_token text;
  v_created timestamptz;
begin
  if p_seller_name is null or btrim(p_seller_name) = '' then
    raise exception 'seller_name is required';
  end if;

  insert into public.cases (
    seller_name,
    company_name,
    address,
    contact_name,   -- NY
    contact_email,  -- NY
    contact_phone,  -- NY
    inputs,
    outputs,
    current_annual_cost_dkk,
    investment_dkk,
    new_annual_cost_dkk,
    break_even_years,
    horizon_years
  )
  values (
    btrim(p_seller_name),
    nullif(btrim(p_company_name), ''),
    nullif(btrim(p_address), ''),
    nullif(btrim(p_contact_name), ''),  -- NY
    nullif(btrim(p_contact_email), ''), -- NY
    nullif(btrim(p_contact_phone), ''), -- NY
    coalesce(p_inputs, '{}'::jsonb),
    coalesce(p_outputs, '{}'::jsonb),
    p_current_annual_cost_dkk,
    p_investment_dkk,
    p_new_annual_cost_dkk,
    p_break_even_years,
    p_horizon_years
  )
  returning cases.id, cases.share_token, cases.created_at into v_id, v_token, v_created;

  case_id := v_id;
  share_token := v_token;
  share_enabled := false;
  share_expires_at := null;
  created_at := v_created;

  return next;
end;
$$;

-- Gen-grant rettigheder
grant execute on function public.create_case_anon(
  text, text, text, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
) to anon;

grant execute on function public.create_case_anon(
  text, text, text, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
) to authenticated;
