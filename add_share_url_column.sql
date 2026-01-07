-- =========================================================
-- UPDATE: Store Full Share URL
-- 1. Tilføjer 'full_share_url' kolonne
-- 2. Opdaterer create_case_anon til at modtage base_url og gemme hele linket
-- =========================================================

-- 1. Tilføj kolonne
alter table public.cases 
  add column if not exists full_share_url text;

-- 2. Opdater RPC funktionen (Drop den gamle for at opdatere parametre)
drop function if exists public.create_case_anon(
  text, text, text, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
);

create or replace function public.create_case_anon(
  p_seller_name text,
  p_company_name text,
  p_address text,
  p_contact_name text,
  p_contact_email text,
  p_contact_phone text,
  p_base_url text,       -- NY PARAMETER
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
  v_full_url text;
begin
  if p_seller_name is null or btrim(p_seller_name) = '' then
    raise exception 'seller_name is required';
  end if;

  -- Generer token manuelt her, så vi kan bygge URL'en med det samme
  v_token := public.generate_share_token();
  
  -- Byg fuld URL (hvis base_url er medsendt)
  if p_base_url is not null and p_base_url <> '' then
     v_full_url := p_base_url || '?share=' || v_token;
  else
     v_full_url := null;
  end if;

  insert into public.cases (
    seller_name,
    company_name,
    address,
    contact_name,
    contact_email,
    contact_phone,
    share_token,      -- Vi indsætter token explicit
    full_share_url,   -- Og den fulde URL
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
    nullif(btrim(p_contact_name), ''),
    nullif(btrim(p_contact_email), ''),
    nullif(btrim(p_contact_phone), ''),
    v_token,          -- Indsæt genereret token
    v_full_url,       -- Indsæt genereret URL
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
  text, text, text, text, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
) to anon;

grant execute on function public.create_case_anon(
  text, text, text, text, text, text, text, jsonb, jsonb, numeric, numeric, numeric, numeric, int
) to authenticated;
