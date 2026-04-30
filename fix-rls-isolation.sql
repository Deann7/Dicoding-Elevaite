-- ============================================================
-- VOLT-GUARD: COMPLETE MULTI-TENANT ISOLATION FIX
-- Run this in Supabase SQL Editor — Step by step
-- ============================================================

-- ============================================================
-- DIAGNOSIS: Cek kondisi saat ini
-- ============================================================

-- Cek apakah kolom user_id sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('pallets', 'qa_inspections', 'pallet_events', 'system_settings')
  AND column_name = 'user_id'
ORDER BY table_name;

-- Cek berapa banyak data orphan (user_id IS NULL)
SELECT 'pallets' as tbl, COUNT(*) as orphan_rows FROM public.pallets WHERE user_id IS NULL
UNION ALL
SELECT 'qa_inspections', COUNT(*) FROM public.qa_inspections WHERE user_id IS NULL
UNION ALL
SELECT 'pallet_events', COUNT(*) FROM public.pallet_events WHERE user_id IS NULL
UNION ALL
SELECT 'system_settings', COUNT(*) FROM public.system_settings WHERE user_id IS NULL;

-- Cek RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('pallets', 'qa_inspections', 'pallet_events', 'system_settings');

-- Cek policy yang sedang aktif
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================
-- STEP 1: Tambah user_id ke semua tabel (jika belum ada)
-- ============================================================

ALTER TABLE public.pallets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.qa_inspections
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.pallet_events
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- STEP 2: Aktifkan RLS di semua tabel
-- ============================================================

ALTER TABLE public.pallets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_inspections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallet_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: DROP semua policy lama (clean slate)
-- ============================================================

-- Pallets
DROP POLICY IF EXISTS "anon_read_pallets"       ON public.pallets;
DROP POLICY IF EXISTS "anon_read_vendors"       ON public.pallets;
DROP POLICY IF EXISTS "service_all_pallets"     ON public.pallets;
DROP POLICY IF EXISTS "user_read_own_pallets"   ON public.pallets;
DROP POLICY IF EXISTS "user_insert_own_pallets" ON public.pallets;
DROP POLICY IF EXISTS "user_update_own_pallets" ON public.pallets;
DROP POLICY IF EXISTS "user_delete_own_pallets" ON public.pallets;
DROP POLICY IF EXISTS "pallets_select_own"      ON public.pallets;
DROP POLICY IF EXISTS "pallets_insert_own"      ON public.pallets;
DROP POLICY IF EXISTS "pallets_update_own"      ON public.pallets;
DROP POLICY IF EXISTS "pallets_delete_own"      ON public.pallets;

-- QA Inspections
DROP POLICY IF EXISTS "anon_read_qa"            ON public.qa_inspections;
DROP POLICY IF EXISTS "service_all_qa"          ON public.qa_inspections;
DROP POLICY IF EXISTS "user_read_own_qa"        ON public.qa_inspections;
DROP POLICY IF EXISTS "user_insert_own_qa"      ON public.qa_inspections;
DROP POLICY IF EXISTS "qa_select_own"           ON public.qa_inspections;
DROP POLICY IF EXISTS "qa_insert_own"           ON public.qa_inspections;
DROP POLICY IF EXISTS "qa_update_own"           ON public.qa_inspections;

-- Pallet Events
DROP POLICY IF EXISTS "anon_read_events"        ON public.pallet_events;
DROP POLICY IF EXISTS "service_all_events"      ON public.pallet_events;
DROP POLICY IF EXISTS "user_read_own_events"    ON public.pallet_events;
DROP POLICY IF EXISTS "user_insert_own_events"  ON public.pallet_events;
DROP POLICY IF EXISTS "events_select_own"       ON public.pallet_events;
DROP POLICY IF EXISTS "events_insert_own"       ON public.pallet_events;

-- System Settings
DROP POLICY IF EXISTS "anon_read_settings"      ON public.system_settings;
DROP POLICY IF EXISTS "service_all_settings"    ON public.system_settings;
DROP POLICY IF EXISTS "user_manage_own_settings" ON public.system_settings;
DROP POLICY IF EXISTS "settings_all_own"        ON public.system_settings;

-- ============================================================
-- STEP 4: Buat policy baru yang ketat per user_id
-- ============================================================

-- === PALLETS ===
-- SELECT: hanya baca milik sendiri
CREATE POLICY "pallets_select_own"
  ON public.pallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: hanya bisa insert dengan user_id milik sendiri
CREATE POLICY "pallets_insert_own"
  ON public.pallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: hanya bisa update milik sendiri
CREATE POLICY "pallets_update_own"
  ON public.pallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: hanya bisa hapus milik sendiri
CREATE POLICY "pallets_delete_own"
  ON public.pallets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypass (untuk API backend)
CREATE POLICY "pallets_service_all"
  ON public.pallets FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- === QA INSPECTIONS ===
CREATE POLICY "qa_select_own"
  ON public.qa_inspections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "qa_insert_own"
  ON public.qa_inspections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qa_update_own"
  ON public.qa_inspections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "qa_service_all"
  ON public.qa_inspections FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- === PALLET EVENTS ===
CREATE POLICY "events_select_own"
  ON public.pallet_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "events_insert_own"
  ON public.pallet_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "events_service_all"
  ON public.pallet_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- === SYSTEM SETTINGS ===
CREATE POLICY "settings_select_own"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "settings_insert_own"
  ON public.system_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_update_own"
  ON public.system_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "settings_service_all"
  ON public.system_settings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 5: HAPUS data orphan (user_id IS NULL)
-- Data ini tidak punya pemilik dan akan terlihat oleh siapa saja
-- yang punya policy USING(true). Harus dihapus.
-- ============================================================

-- Preview dulu
SELECT 'AKAN DIHAPUS - pallets:', COUNT(*) FROM public.pallets WHERE user_id IS NULL
UNION ALL
SELECT 'AKAN DIHAPUS - qa_inspections:', COUNT(*) FROM public.qa_inspections WHERE user_id IS NULL
UNION ALL
SELECT 'AKAN DIHAPUS - pallet_events:', COUNT(*) FROM public.pallet_events WHERE user_id IS NULL
UNION ALL
SELECT 'AKAN DIHAPUS - system_settings:', COUNT(*) FROM public.system_settings WHERE user_id IS NULL;

-- Hapus pallet_events orphan dulu (ada FK ke pallets)
DELETE FROM public.pallet_events WHERE user_id IS NULL;
DELETE FROM public.qa_inspections WHERE user_id IS NULL;
DELETE FROM public.pallets WHERE user_id IS NULL;
DELETE FROM public.system_settings WHERE user_id IS NULL;

-- ============================================================
-- STEP 6: Update trigger agar pallet_events dapat user_id
-- dari pallets parent saat status berubah
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_pallet_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_source TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    BEGIN
      v_source := current_setting('app.trigger_source', true);
    EXCEPTION WHEN OTHERS THEN
      v_source := NULL;
    END;

    IF v_source IS NULL OR v_source = '' THEN
      v_source := 'SYSTEM';
    END IF;

    INSERT INTO public.pallet_events (
      pallet_id, pallet_code,
      previous_status, new_status,
      trigger_source, note,
      temperature_at_event,
      user_id   -- ← ambil dari parent pallet
    ) VALUES (
      NEW.id, NEW.pallet_code,
      OLD.status, NEW.status,
      v_source,
      NEW.alert_reason,
      NEW.temperature,
      NEW.user_id  -- ← propagate user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 7: Update RPC release_pallet_from_qa agar user-aware
-- ============================================================

CREATE OR REPLACE FUNCTION public.release_pallet_from_qa(
  p_pallet_code   TEXT,
  p_document_name TEXT,
  p_avg_voltage   NUMERIC,
  p_impedance     NUMERIC,
  p_ai_confidence NUMERIC,
  p_passed_qa     BOOLEAN,
  p_fail_reason   TEXT    DEFAULT NULL,
  p_user_id       UUID    DEFAULT NULL   -- ← parameter baru
)
RETURNS SETOF public.pallets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pallet_id   UUID;
  v_new_status  TEXT;
  v_uid         UUID;
BEGIN
  -- Resolusi user_id
  v_uid := COALESCE(p_user_id, auth.uid());

  PERFORM set_config('app.trigger_source', 'QA_SCANNER', true);

  -- Cari pallet HANYA milik user ini (multi-tenant safe)
  SELECT id INTO v_pallet_id
  FROM public.pallets
  WHERE pallet_code = p_pallet_code
    AND (user_id = v_uid OR user_id IS NULL);  -- toleransi data lama

  IF v_pallet_id IS NULL THEN
    -- Pallet belum ada → buat baru untuk user ini
    INSERT INTO public.pallets (
      pallet_code, status, vendor_name, temperature,
      humidity, cell_count, location, user_id
    ) VALUES (
      p_pallet_code,
      CASE WHEN p_passed_qa THEN 'OK' ELSE 'REJECT' END,
      'QA Scanner', 25.0, 50.0, 48, 'QA Station',
      v_uid
    )
    RETURNING id INTO v_pallet_id;
  END IF;

  v_new_status := CASE WHEN p_passed_qa THEN 'OK' ELSE 'REJECT' END;

  -- Insert QA inspection record
  INSERT INTO public.qa_inspections (
    pallet_id, pallet_code, document_name,
    avg_voltage, impedance, ai_confidence,
    passed_qa, fail_reason, user_id
  ) VALUES (
    v_pallet_id, p_pallet_code, p_document_name,
    p_avg_voltage, p_impedance, p_ai_confidence,
    p_passed_qa, p_fail_reason, v_uid
  );

  -- Update pallet status
  RETURN QUERY
  UPDATE public.pallets
  SET
    status       = v_new_status,
    alert_reason = CASE WHEN NOT p_passed_qa THEN p_fail_reason ELSE NULL END,
    last_updated = now()
  WHERE id = v_pallet_id
  RETURNING *;
END;
$$;

-- Grant ulang ke service_role
GRANT EXECUTE ON FUNCTION public.release_pallet_from_qa(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT, UUID) TO service_role;

-- ============================================================
-- STEP 8: Tambah constraint INDEX untuk performa query tenant
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pallets_user_id ON public.pallets (user_id);
CREATE INDEX IF NOT EXISTS idx_qa_inspections_user_id ON public.qa_inspections (user_id);
CREATE INDEX IF NOT EXISTS idx_pallet_events_user_id ON public.pallet_events (user_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON public.system_settings (user_id);

-- ============================================================
-- STEP 9: TEST ISOLATION
-- Ganti <USER_A_UUID> dan <USER_B_UUID> dengan UUID asli
-- dari Supabase Auth > Users
-- ============================================================

-- Test 1: Verifikasi tidak ada data bocor antara user
-- (Semua harus mengembalikan 0 atau hanya data milik user tersebut)
-- SELECT * FROM public.pallets WHERE user_id = '<USER_A_UUID>';
-- SELECT * FROM public.pallets WHERE user_id = '<USER_B_UUID>';

-- Test 2: Verifikasi RLS policy aktif
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pallets', 'qa_inspections', 'pallet_events', 'system_settings')
ORDER BY tablename, policyname;

-- Test 3: Final count per user
SELECT user_id, COUNT(*) as pallet_count
FROM public.pallets
GROUP BY user_id
ORDER BY pallet_count DESC;

-- ============================================================
-- STEP 10: Verifikasi get_audit_log RPC juga user-aware
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_audit_log(
  p_limit   INT  DEFAULT 50,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  event_id             UUID,
  pallet_code          TEXT,
  previous_status      TEXT,
  new_status           TEXT,
  trigger_source       TEXT,
  note                 TEXT,
  temperature_at_event NUMERIC,
  created_at           TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id, pallet_code, previous_status, new_status,
    trigger_source, note, temperature_at_event, created_at
  FROM public.pallet_events
  WHERE user_id = COALESCE(p_user_id, auth.uid())
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_audit_log(INT, UUID) TO authenticated, service_role;
