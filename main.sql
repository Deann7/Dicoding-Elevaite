-- ============================================================
-- ELEVAITE VOLT-GUARD: Complete Database Schema
-- Run this in your Supabase SQL Editor (fresh setup)
-- ============================================================
-- TABLES:
--   1. vendors          — Master data supplier baterai EV
--   2. pallets          — Inventaris palet baterai utama (EV Monitor)
--   3. pallet_events    — Log historis setiap perubahan status palet
--   4. qa_inspections   — Rekaman hasil scan dokumen Lab/QC (QA Auto-Release)
-- ============================================================

-- ============================================================
-- DROP (untuk re-run bersih jika diperlukan)
-- ============================================================
DROP TABLE IF EXISTS public.qa_inspections   CASCADE;
DROP TABLE IF EXISTS public.pallet_events    CASCADE;
DROP TABLE IF EXISTS public.pallets          CASCADE;
DROP TABLE IF EXISTS public.vendors          CASCADE;

-- ============================================================
-- 1. VENDORS (Master Data Supplier)
-- ============================================================
CREATE TABLE public.vendors (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL UNIQUE,
  country     TEXT    NOT NULL DEFAULT 'South Korea',
  contact     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.vendors (name, country) VALUES
  ('CATL',        'China'),
  ('LG Chem',     'South Korea'),
  ('Panasonic',   'Japan'),
  ('Samsung SDI', 'South Korea')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 2. PALLETS (Core Inventory — digunakan oleh EV Monitor)
-- ============================================================
CREATE TABLE public.pallets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_code   TEXT        NOT NULL UNIQUE,
  -- Status: OK = aman; ON HOLD = perlu inspeksi; REJECT = karantina;
  -- UNRELEASED = menunggu QA release (baru masuk gudang, belum diizinkan)
  status        TEXT        NOT NULL DEFAULT 'UNRELEASED'
                            CHECK (status IN ('OK', 'ON HOLD', 'REJECT', 'UNRELEASED')),
  temperature   NUMERIC(5,2) NOT NULL DEFAULT 25.0,  -- °C (dari sensor IoT)
  humidity      NUMERIC(5,2),                         -- % (dari sensor IoT)
  location      TEXT        NOT NULL DEFAULT 'Zone A · Rack 1',
  cell_count    INTEGER     NOT NULL DEFAULT 48,
  vendor_name   TEXT        NOT NULL REFERENCES public.vendors(name) ON UPDATE CASCADE,
  alert_reason  TEXT,                                -- Diisi otomatis oleh API IoT
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. PALLET_EVENTS (Audit Trail — setiap perubahan status dicatat)
-- ============================================================
-- Diisi otomatis via TRIGGER setiap kali status palet berubah.
-- Bisa ditampilkan di halaman "Audit Logs".
CREATE TABLE public.pallet_events (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_id       UUID    NOT NULL REFERENCES public.pallets(id) ON DELETE CASCADE,
  pallet_code     TEXT    NOT NULL,
  previous_status TEXT,
  new_status      TEXT    NOT NULL,
  trigger_source  TEXT    NOT NULL DEFAULT 'SYSTEM'
                          CHECK (trigger_source IN ('IOT_SENSOR', 'QA_SCANNER', 'MANUAL', 'SYSTEM')),
  note            TEXT,
  temperature_at_event NUMERIC(5,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. QA_INSPECTIONS (Rekaman scan dokumen — digunakan oleh QA Auto-Release)
-- ============================================================
CREATE TABLE public.qa_inspections (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_id       UUID    REFERENCES public.pallets(id) ON DELETE SET NULL,
  pallet_code     TEXT    NOT NULL,
  -- Hasil ekstraksi OCR/AI
  document_name   TEXT    NOT NULL,
  avg_voltage     NUMERIC(6,3),       -- V (misal: 4.18)
  impedance       NUMERIC(6,3),       -- mΩ (misal: 1.2)
  ai_confidence   NUMERIC(5,2),       -- % (misal: 98.4)
  -- Keputusan sistem
  passed_qa       BOOLEAN NOT NULL DEFAULT false,
  fail_reason     TEXT,               -- Diisi jika passed_qa = false
  -- Metadata
  released_by     TEXT    DEFAULT 'AI Auto-Release',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGER: Auto-log ke pallet_events setiap kali status palet berubah
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_pallet_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya log jika statusnya benar-benar berubah
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.pallet_events (
      pallet_id, pallet_code,
      previous_status, new_status,
      trigger_source, note,
      temperature_at_event
    ) VALUES (
      NEW.id, NEW.pallet_code,
      OLD.status, NEW.status,
      CASE
        WHEN NEW.alert_reason IS NOT NULL THEN 'IOT_SENSOR'
        ELSE 'SYSTEM'
      END,
      NEW.alert_reason,
      NEW.temperature
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pallet_status_change_trigger
  AFTER UPDATE ON public.pallets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pallet_status_change();

-- ============================================================
-- SEED DATA: 9 palet demo (termasuk 1 palet UNRELEASED untuk demo QA Scanner)
-- ============================================================
INSERT INTO public.pallets (pallet_code, temperature, humidity, status, location, cell_count, vendor_name, alert_reason)
VALUES
  ('B-101', 22.0, 48.0, 'OK',         'Zone A · Rack 1', 48, 'CATL',        NULL),
  ('B-102', 24.0, 51.0, 'OK',         'Zone A · Rack 2', 48, 'CATL',        NULL),
  ('B-103', 26.0, 55.0, 'OK',         'Zone B · Rack 1', 96, 'LG Chem',     NULL),
  ('B-104', 28.0, 59.0, 'OK',         'Zone B · Rack 2', 96, 'LG Chem',     NULL),
  ('B-105', 37.0, 66.0, 'ON HOLD',    'Zone C · Rack 1', 48, 'Panasonic',   'WARNING: Temperature 37°C above safe range (35°C). Pending inspection.'),
  ('B-106', 21.0, 45.0, 'OK',         'Zone C · Rack 2', 72, 'Samsung SDI', NULL),
  ('B-107', 23.0, 50.0, 'OK',         'Zone D · Rack 1', 72, 'Samsung SDI', NULL),
  ('B-108', 25.0, 52.0, 'OK',         'Zone D · Rack 2', 48, 'CATL',        NULL),
  ('B-109', 23.5, 49.0, 'UNRELEASED', 'Zone E · Rack 1', 96, 'LG Chem',     NULL)
ON CONFLICT (pallet_code) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.vendors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallet_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_inspections   ENABLE ROW LEVEL SECURITY;

-- Anon: baca semua (untuk demo publik)
CREATE POLICY "anon_read_vendors"       ON public.vendors        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_pallets"       ON public.pallets        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_events"        ON public.pallet_events  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_qa"            ON public.qa_inspections FOR SELECT TO anon USING (true);

-- Service role: akses penuh (untuk API routes backend)
CREATE POLICY "service_all_vendors"     ON public.vendors        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_pallets"     ON public.pallets        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_events"      ON public.pallet_events  FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_qa"          ON public.qa_inspections FOR ALL TO service_role USING (true);

-- ============================================================
-- REALTIME: Aktifkan untuk tabel yang perlu live update di dashboard
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pallet_events;
