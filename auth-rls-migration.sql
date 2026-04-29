-- ============================================================
-- ELEVAITE VOLT-GUARD: AUTH & MULTI-TENANT RLS MIGRATION
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: Tambah user_id ke tabel utama
-- ============================================================

-- Tambah user_id ke pallets
ALTER TABLE public.pallets
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tambah user_id ke qa_inspections
ALTER TABLE public.qa_inspections
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tambah user_id ke pallet_events
ALTER TABLE public.pallet_events
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Tambah user_id ke system_settings
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================================
-- STEP 2: Index untuk performa query user-filtered
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pallets_user_id ON public.pallets (user_id);
CREATE INDEX IF NOT EXISTS idx_qa_inspections_user_id ON public.qa_inspections (user_id);
CREATE INDEX IF NOT EXISTS idx_pallet_events_user_id ON public.pallet_events (user_id);

-- ============================================================
-- STEP 3: HAPUS semua policy lama yang terlalu permissive (anon access)
-- ============================================================
DROP POLICY IF EXISTS "anon_read_pallets"       ON public.pallets;
DROP POLICY IF EXISTS "anon_read_events"        ON public.pallet_events;
DROP POLICY IF EXISTS "anon_read_qa"            ON public.qa_inspections;
DROP POLICY IF EXISTS "anon_read_settings"      ON public.system_settings;

-- ============================================================
-- STEP 4: Buat policy baru berbasis auth.uid()
-- (Hanya user yang login yang bisa baca data miliknya sendiri)
-- ============================================================

-- PALLETS: hanya bisa baca milik sendiri
CREATE POLICY "user_read_own_pallets"
  ON public.pallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_pallets"
  ON public.pallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_update_own_pallets"
  ON public.pallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_delete_own_pallets"
  ON public.pallets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PALLET EVENTS: hanya bisa baca milik sendiri
CREATE POLICY "user_read_own_events"
  ON public.pallet_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_events"
  ON public.pallet_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- QA INSPECTIONS: hanya bisa baca milik sendiri
CREATE POLICY "user_read_own_qa"
  ON public.qa_inspections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_insert_own_qa"
  ON public.qa_inspections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SYSTEM SETTINGS: per user
CREATE POLICY "user_manage_own_settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 5: Update trigger agar otomatis isi user_id dari context
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
      user_id
    ) VALUES (
      NEW.id, NEW.pallet_code,
      OLD.status, NEW.status,
      v_source,
      NEW.alert_reason,
      NEW.temperature,
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 6: Update seed data pallets → assign ke user yang ada
-- (Ini hanya dipakai saat demo — assign semua ke 1 user)
-- Catatan: Ganti <YOUR_USER_ID> dengan UUID user Anda dari
--          Supabase Auth > Users
-- ============================================================
-- UPDATE public.pallets SET user_id = '<YOUR_USER_ID>';
-- UPDATE public.qa_inspections SET user_id = '<YOUR_USER_ID>';
-- UPDATE public.pallet_events SET user_id = '<YOUR_USER_ID>';
-- UPDATE public.system_settings SET user_id = '<YOUR_USER_ID>';

-- ============================================================
-- STEP 7: Realtime untuk qa_inspections juga
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.qa_inspections;
