-- ============================================================
-- SUPABASE: FUNCTION AUTO-SEED PALLET DATA SAAT USER REGISTER
-- Jalankan di Supabase SQL Editor setelah auth-rls-migration.sql
-- ============================================================

-- Function: dipanggil otomatis saat user baru sign up
-- Akan membuat pallet sample (demo data) untuk setiap user baru
CREATE OR REPLACE FUNCTION public.handle_new_user_seed_data()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := NEW.id;

  -- Insert vendor defaults jika belum ada
  INSERT INTO public.vendors (name, country) VALUES
    ('CATL',        'China'),
    ('LG Chem',     'South Korea'),
    ('Panasonic',   'Japan'),
    ('Samsung SDI', 'South Korea')
  ON CONFLICT (name) DO NOTHING;

  -- Insert sample pallets khusus untuk user baru ini
  INSERT INTO public.pallets (pallet_code, temperature, humidity, status, location, cell_count, vendor_name, alert_reason, user_id)
  VALUES
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-101'), 22.0, 48.0, 'OK',         'Zone A · Rack 1', 48, 'CATL',        NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-102'), 24.0, 51.0, 'OK',         'Zone A · Rack 2', 48, 'CATL',        NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-103'), 26.0, 55.0, 'OK',         'Zone B · Rack 1', 96, 'LG Chem',     NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-104'), 28.0, 59.0, 'OK',         'Zone B · Rack 2', 96, 'LG Chem',     NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-105'), 37.0, 66.0, 'ON HOLD',    'Zone C · Rack 1', 48, 'Panasonic',   'WARNING: Temperature 37°C above safe range (35°C). Pending inspection.', v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-106'), 21.0, 45.0, 'OK',         'Zone C · Rack 2', 72, 'Samsung SDI', NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-107'), 23.0, 50.0, 'OK',         'Zone D · Rack 1', 72, 'Samsung SDI', NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-108'), 25.0, 52.0, 'OK',         'Zone D · Rack 2', 48, 'CATL',        NULL, v_user_id),
    (concat('B-', substr(md5(v_user_id::text), 1, 3), '-109'), 23.5, 49.0, 'UNRELEASED', 'Zone E · Rack 1', 96, 'LG Chem',     NULL, v_user_id)
  ON CONFLICT (pallet_code) DO NOTHING;

  -- Insert default system settings untuk user baru
  INSERT INTO public.system_settings (business_name, industry_segment, energy_tariff_per_kwh, hvac_tolerance_celsius, user_id)
  VALUES ('PT Sinergi Manufaktur', 'Automotive Parts', 1500.00, 2.00, v_user_id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: tembak function di atas setiap kali ada user baru di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_seed_data();

-- ============================================================
-- STEP MANUAL: Assign data seed yang sudah ada ke user pertama
-- Ganti YOUR_USER_ID dengan UUID Anda dari Supabase > Authentication > Users
-- ============================================================
-- UPDATE public.pallets SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE public.qa_inspections SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE public.pallet_events SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- UPDATE public.system_settings SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
