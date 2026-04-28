-- ============================================================
-- ELEVAITE VOLT-GUARD: Migration SQL
-- Jalankan SETELAH main.sql dan setup-rpc.sql sudah ada di DB.
-- Berisi semua perubahan dari existing schema ke kebutuhan app terbaru.
-- ============================================================
-- PERUBAHAN:
--   FIX-1:  Tambah nilai UNRELEASED ke CHECK constraint pallets.status
--           (sudah ada di main.sql, tidak perlu diubah jika fresh setup)
--   FIX-2:  businesses — tambah kolom yang dibutuhkan settings page
--   NEW-1:  Tabel zones       (Eco-Zone System / Inventory page)
--   NEW-2:  Tabel zone_inventory (Isi inventaris per zona)
--   NEW-3:  Tabel system_settings (konfigurasi Settings page)
--   FIX-3:  Trigger — perbaiki logika deteksi trigger_source
--   FIX-4:  RPC release_pallet_from_qa — fail QA → tetap UNRELEASED
--   NEW-4:  RPC get_zones_with_inventory
--   NEW-5:  Performance indexes
--   NEW-6:  RLS untuk tabel baru
--   NEW-7:  Seed data zones & zone_inventory (sesuai mock frontend)
-- ============================================================

-- ============================================================
-- BAGIAN 1: DROP TABEL BARU (jika migration dijalankan ulang)
-- ============================================================
DROP TABLE IF EXISTS public.zone_inventory CASCADE;
DROP TABLE IF EXISTS public.zones          CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- ============================================================
-- BAGIAN 2: NEW-1 — TABEL zones
-- Digunakan oleh halaman /dashboard/inventory (Eco-Zone System)
-- ============================================================
CREATE TABLE public.zones (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Opsional: link ke businesses jika multi-tenant
  -- business_id       UUID    REFERENCES public.businesses(id) ON DELETE CASCADE,
  grid_id              TEXT    NOT NULL UNIQUE,   -- "A1", "B2", dst.
  name                 TEXT    NOT NULL,
  type                 TEXT    NOT NULL DEFAULT 'warehouse'
                               CHECK (type IN ('warehouse', 'production', 'cold_storage')),
  is_climate_controlled BOOLEAN NOT NULL DEFAULT false,
  status               TEXT    NOT NULL DEFAULT 'healthy'
                               CHECK (status IN ('healthy', 'idle', 'critical')),
  capacity_used        INTEGER NOT NULL DEFAULT 0 CHECK (capacity_used BETWEEN 0 AND 100),
  energy_status        TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.zones IS 
  'Zona fisik gudang — dipakai oleh halaman Eco-Zone System (Inventory).';

-- ============================================================
-- BAGIAN 3: NEW-2 — TABEL zone_inventory
-- Item inventaris per zona
-- ============================================================
CREATE TABLE public.zone_inventory (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     UUID    NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  item_name   TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'released'
              CHECK (status IN ('unreleased', 'released', 'on_hold', 'reject')),
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.zone_inventory IS 
  'Item inventaris di dalam setiap zona fisik.';

-- ============================================================
-- BAGIAN 4: NEW-3 — TABEL system_settings
-- Konfigurasi Settings Page (tarif energi, toleransi HVAC, dsb.)
-- ============================================================
CREATE TABLE public.system_settings (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 1 baris per bisnis / instalasi
  business_name           TEXT    NOT NULL DEFAULT 'PT Sinergi Manufaktur',
  industry_segment        TEXT    NOT NULL DEFAULT 'Automotive Parts',
  energy_tariff_per_kwh   NUMERIC(10,2) NOT NULL DEFAULT 1500.00, -- IDR
  hvac_tolerance_celsius  NUMERIC(4,2)  NOT NULL DEFAULT 2.00,    -- ±°C
  -- Key disimpan terenkripsi di aplikasi, hanya ciphertext di sini
  azure_doc_intel_key_enc TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.system_settings IS 
  'Konfigurasi sistem — satu baris saja (singleton). Dipakai oleh Settings page.';

-- Insert default row
INSERT INTO public.system_settings (business_name, industry_segment, energy_tariff_per_kwh, hvac_tolerance_celsius)
VALUES ('PT Sinergi Manufaktur', 'Automotive Parts', 1500.00, 2.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- BAGIAN 5: FIX-2 — Perbaiki tabel businesses
-- Tambah kolom yang lebih relevan untuk Settings page
-- ============================================================
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS industry_segment TEXT DEFAULT 'Automotive Parts',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- BAGIAN 6: NEW-5 — Performance Indexes
-- ============================================================
-- Index untuk filter status palet (query paling sering di EV Monitor)
CREATE INDEX IF NOT EXISTS idx_pallets_status
  ON public.pallets (status);

-- Index untuk sort audit log by time (dipakai get_audit_log RPC)
CREATE INDEX IF NOT EXISTS idx_pallet_events_created_at
  ON public.pallet_events (created_at DESC);

-- Index untuk lookup by pallet_code (dipakai IoT & QA RPCs)
CREATE INDEX IF NOT EXISTS idx_pallets_pallet_code
  ON public.pallets (pallet_code);

-- Index zones by grid_id (lookup di Eco-Zone System)
CREATE INDEX IF NOT EXISTS idx_zones_grid_id
  ON public.zones (grid_id);

-- Index zone_inventory by zone_id
CREATE INDEX IF NOT EXISTS idx_zone_inventory_zone_id
  ON public.zone_inventory (zone_id);

-- ============================================================
-- BAGIAN 7: FIX-3 — Perbaiki Trigger trigger_source Logic
-- Masalah: kalau MANUAL update tapi ada alert_reason, salah deteksi IOT_SENSOR
-- Solusi:  Gunakan kolom trigger_source dari pallet_events langsung,
--          atau pakai session variable untuk passing context.
--          Pendekatan terbaik: pisahkan via SET LOCAL di RPC.
-- ============================================================
-- Drop trigger dan function lama, replace dengan versi yang lebih robust
CREATE OR REPLACE FUNCTION public.log_pallet_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_source TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Cek apakah ada session variable yang di-set oleh RPC pemanggil
    -- RPC IoT  → set local app.trigger_source = 'IOT_SENSOR'
    -- RPC QA   → set local app.trigger_source = 'QA_SCANNER'
    -- Manual   → set local app.trigger_source = 'MANUAL'
    -- Default  → 'SYSTEM'
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
      temperature_at_event
    ) VALUES (
      NEW.id, NEW.pallet_code,
      OLD.status, NEW.status,
      v_source,
      NEW.alert_reason,
      NEW.temperature
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sudah ada, tidak perlu CREATE ulang — hanya function-nya yang diganti di atas.

-- ============================================================
-- BAGIAN 8: FIX-4 — Perbaiki RPC release_pallet_from_qa
-- Masalah: jika QA gagal, status di-set ON HOLD (salah).
--          Harusnya tetap UNRELEASED sampai ada re-scan yang berhasil.
-- ============================================================
CREATE OR REPLACE FUNCTION public.release_pallet_from_qa(
  p_pallet_code   TEXT,
  p_document_name TEXT,
  p_avg_voltage   NUMERIC,
  p_impedance     NUMERIC,
  p_ai_confidence NUMERIC,
  p_passed_qa     BOOLEAN,
  p_fail_reason   TEXT DEFAULT NULL
)
RETURNS SETOF public.pallets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pallet_id   UUID;
  v_new_status  TEXT;
BEGIN
  -- Set trigger source untuk audit log
  PERFORM set_config('app.trigger_source', 'QA_SCANNER', true);

  -- Ambil ID palet
  SELECT id INTO v_pallet_id
  FROM public.pallets
  WHERE pallet_code = p_pallet_code;

  IF v_pallet_id IS NULL THEN
    RAISE EXCEPTION 'Pallet dengan kode % tidak ditemukan.', p_pallet_code;
  END IF;

  -- FIX: Jika QA gagal → status tetap UNRELEASED (bukan ON HOLD)
  -- Jika QA lulus    → status menjadi OK
  v_new_status := CASE WHEN p_passed_qa THEN 'OK' ELSE 'UNRELEASED' END;

  -- Simpan rekaman inspeksi QA
  INSERT INTO public.qa_inspections (
    pallet_id, pallet_code, document_name,
    avg_voltage, impedance, ai_confidence,
    passed_qa, fail_reason
  ) VALUES (
    v_pallet_id, p_pallet_code, p_document_name,
    p_avg_voltage, p_impedance, p_ai_confidence,
    p_passed_qa, p_fail_reason
  );

  -- Update status palet
  RETURN QUERY
  UPDATE public.pallets
  SET
    status       = v_new_status,
    alert_reason = CASE WHEN NOT p_passed_qa THEN p_fail_reason ELSE NULL END,
    last_updated = now()
  WHERE pallet_code = p_pallet_code
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_pallet_from_qa(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT)
  TO service_role;

-- ============================================================
-- BAGIAN 9: Perbaiki RPC update_pallet_from_iot
-- Tambah set_config untuk trigger_source yang benar
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_pallet_from_iot(
  p_pallet_code TEXT,
  p_temperature NUMERIC,
  p_humidity    NUMERIC DEFAULT NULL
)
RETURNS SETOF public.pallets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_status    TEXT;
  v_alert_reason  TEXT;
BEGIN
  -- Set trigger source untuk audit log
  PERFORM set_config('app.trigger_source', 'IOT_SENSOR', true);

  -- Tentukan status berdasarkan threshold suhu
  IF p_temperature >= 42 THEN
    v_new_status   := 'REJECT';
    v_alert_reason := format(
      'CRITICAL: Thermal Runaway Risk — Temperature %s°C melebihi batas aman 42°C. Auto-quarantine diaktifkan.',
      p_temperature
    );
  ELSIF p_temperature >= 35 THEN
    v_new_status   := 'ON HOLD';
    v_alert_reason := format(
      'WARNING: Temperature %s°C di atas batas aman (35°C). Menunggu inspeksi.',
      p_temperature
    );
  ELSE
    v_new_status   := 'OK';
    v_alert_reason := NULL;
  END IF;

  RETURN QUERY
  UPDATE public.pallets
  SET
    temperature  = p_temperature,
    humidity     = COALESCE(p_humidity, humidity),
    status       = v_new_status,
    alert_reason = v_alert_reason,
    last_updated = now()
  WHERE pallet_code = p_pallet_code
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_pallet_from_iot(TEXT, NUMERIC, NUMERIC) TO service_role;

-- ============================================================
-- BAGIAN 10: NEW-4 — RPC get_zones_with_inventory
-- Dipanggil oleh halaman /dashboard/inventory
-- Mengembalikan semua zona beserta array item inventarisnya.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_zones_with_inventory()
RETURNS TABLE (
  zone_id               UUID,
  grid_id               TEXT,
  name                  TEXT,
  type                  TEXT,
  is_climate_controlled BOOLEAN,
  status                TEXT,
  capacity_used         INTEGER,
  energy_status         TEXT,
  inventory             JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    z.id                     AS zone_id,
    z.grid_id,
    z.name,
    z.type,
    z.is_climate_controlled,
    z.status,
    z.capacity_used,
    z.energy_status,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id',        zi.id,
          'item_name', zi.item_name,
          'status',    zi.status,
          'quantity',  zi.quantity
        )
      ) FILTER (WHERE zi.id IS NOT NULL),
      '[]'::jsonb
    ) AS inventory
  FROM public.zones z
  LEFT JOIN public.zone_inventory zi ON zi.zone_id = z.id
  GROUP BY z.id, z.grid_id, z.name, z.type, z.is_climate_controlled,
           z.status, z.capacity_used, z.energy_status
  ORDER BY z.grid_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_zones_with_inventory() TO anon, authenticated, service_role;

-- ============================================================
-- BAGIAN 11: NEW-6 — RLS untuk Tabel Baru
-- ============================================================
ALTER TABLE public.zones           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_inventory  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anon: baca semua (untuk demo publik)
CREATE POLICY "anon_read_zones"          ON public.zones           FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_zone_inventory" ON public.zone_inventory  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_settings"       ON public.system_settings FOR SELECT TO anon USING (true);

-- Service role: akses penuh
CREATE POLICY "service_all_zones"          ON public.zones           FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_zone_inventory" ON public.zone_inventory  FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_settings"       ON public.system_settings FOR ALL TO service_role USING (true);

-- ============================================================
-- BAGIAN 12: NEW-7 — Seed Data Zones & Zone Inventory
-- Sesuai dengan MOCK_ZONES di src/app/dashboard/inventory/page.tsx
-- ============================================================
INSERT INTO public.zones (grid_id, name, type, is_climate_controlled, status, capacity_used, energy_status)
VALUES
  ('A1', 'Receiving Bay',    'warehouse',    false, 'healthy',  85, 'Lights Auto (Motion)'),
  ('A2', 'Freezer Unit 1',   'cold_storage', true,  'healthy',  40, 'HVAC Active (-18°C)'),
  ('A3', 'Freezer Unit 2',   'cold_storage', true,  'critical', 15, 'HVAC Maximum (-22°C)'),
  ('A4', 'Assembly Line 1',  'production',   false, 'healthy',  95, 'Machinery Active (80kW)'),
  ('B1', 'Assembly Line 2',  'production',   false, 'idle',      0, 'Power Save (Idle)'),
  ('B2', 'QA Station',       'warehouse',    true,  'healthy',  60, 'HVAC Active (22°C)'),
  ('B3', 'Packaging',        'production',   false, 'healthy',  75, 'Conveyor Active'),
  ('B4', 'Bulk Storage A',   'warehouse',    false, 'healthy',  90, 'Lights Dimmed'),
  ('C1', 'Bulk Storage B',   'warehouse',    true,  'idle',      5, 'HVAC Maintenance'),
  ('C2', 'Hazardous Mat',    'warehouse',    true,  'critical', 80, 'Ventilation Active'),
  ('C3', 'Dispatch A',       'warehouse',    false, 'healthy',  20, 'Doors Open'),
  ('C4', 'Dispatch B',       'warehouse',    false, 'idle',      0, 'Offline')
ON CONFLICT (grid_id) DO NOTHING;

-- Seed zone_inventory (sesuai mock di frontend)
WITH zone_ids AS (
  SELECT id, grid_id FROM public.zones
)
INSERT INTO public.zone_inventory (zone_id, item_name, status, quantity)
SELECT z.id, v.item_name, v.status::TEXT, v.quantity
FROM zone_ids z
JOIN (VALUES
  ('A1', 'Raw Metals',       'released',   5000),
  ('A2', 'Perishables A',    'released',    200),
  ('A2', 'Perishables B',    'on_hold',      50),
  ('A3', 'Spoiled Batch X',  'reject',      800),
  ('A4', 'Component A',      'released',   1200),
  ('B2', 'Pending Checks',   'unreleased',  300),
  ('B3', 'Boxes',            'released',   4500),
  ('B4', 'Finished Goods',   'released',  15000),
  ('C1', 'Packaging Extras', 'on_hold',     150),
  ('C2', 'Chemicals',        'reject',      600),
  ('C3', 'Ready To Ship',    'released',     20)
) AS v(grid_id, item_name, status, quantity) ON z.grid_id = v.grid_id
ON CONFLICT DO NOTHING;

-- ============================================================
-- BAGIAN 13: Realtime untuk Tabel Baru
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_inventory;

-- ============================================================
-- SELESAI
-- Catatan: File src/types/pallet.ts di Next.js juga perlu diupdate:
--   PalletStatus = "OK" | "ON HOLD" | "REJECT" | "UNRELEASED"
--   dan ganti field 'vendor' → 'vendor_name' di interface Pallet
-- ============================================================
