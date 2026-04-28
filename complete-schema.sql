-- ============================================================
-- ELEVAITE VOLT-GUARD: COMPLETE DATABASE SCHEMA
-- Gabungan dari main.sql + setup-rpc.sql + migration.sql
-- Run script ini di Supabase SQL Editor (fresh setup)
-- ============================================================

-- ============================================================
-- 1. DROP EXISTING TABLES (Reset Bersih)
-- ============================================================
DROP TABLE IF EXISTS public.zone_inventory CASCADE;
DROP TABLE IF EXISTS public.zones          CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
DROP TABLE IF EXISTS public.qa_inspections   CASCADE;
DROP TABLE IF EXISTS public.pallet_events    CASCADE;
DROP TABLE IF EXISTS public.pallets          CASCADE;
DROP TABLE IF EXISTS public.vendors          CASCADE;
DROP TABLE IF EXISTS public.businesses       CASCADE;

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- VENDORS
CREATE TABLE public.vendors (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL UNIQUE,
  country     TEXT    NOT NULL DEFAULT 'South Korea',
  contact     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PALLETS
CREATE TABLE public.pallets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_code   TEXT        NOT NULL UNIQUE,
  status        TEXT        NOT NULL DEFAULT 'UNRELEASED'
                            CHECK (status IN ('OK', 'ON HOLD', 'REJECT', 'UNRELEASED')),
  temperature   NUMERIC(5,2) NOT NULL DEFAULT 25.0,
  humidity      NUMERIC(5,2),
  location      TEXT        NOT NULL DEFAULT 'Zone A · Rack 1',
  cell_count    INTEGER     NOT NULL DEFAULT 48,
  vendor_name   TEXT        NOT NULL REFERENCES public.vendors(name) ON UPDATE CASCADE,
  alert_reason  TEXT,
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PALLET EVENTS
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

-- QA INSPECTIONS
CREATE TABLE public.qa_inspections (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  pallet_id       UUID    REFERENCES public.pallets(id) ON DELETE SET NULL,
  pallet_code     TEXT    NOT NULL,
  document_name   TEXT    NOT NULL,
  avg_voltage     NUMERIC(6,3),
  impedance       NUMERIC(6,3),
  ai_confidence   NUMERIC(5,2),
  passed_qa       BOOLEAN NOT NULL DEFAULT false,
  fail_reason     TEXT,
  released_by     TEXT    DEFAULT 'AI Auto-Release',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BUSINESSES (Legacy + New fields)
CREATE TABLE public.businesses (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT    NOT NULL,
  industry_type       TEXT    NOT NULL DEFAULT 'Manufaktur EV',
  industry_segment    TEXT    DEFAULT 'Automotive Parts',
  energy_tariff_per_kwh NUMERIC(10,4) DEFAULT 1.44,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- ZONES (New)
CREATE TABLE public.zones (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  grid_id              TEXT    NOT NULL UNIQUE,
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

-- ZONE INVENTORY (New)
CREATE TABLE public.zone_inventory (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id     UUID    NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  item_name   TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'released'
              CHECK (status IN ('unreleased', 'released', 'on_hold', 'reject')),
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SYSTEM SETTINGS (New)
CREATE TABLE public.system_settings (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name           TEXT    NOT NULL DEFAULT 'PT Sinergi Manufaktur',
  industry_segment        TEXT    NOT NULL DEFAULT 'Automotive Parts',
  energy_tariff_per_kwh   NUMERIC(10,2) NOT NULL DEFAULT 1500.00,
  hvac_tolerance_celsius  NUMERIC(4,2)  NOT NULL DEFAULT 2.00,
  azure_doc_intel_key_enc TEXT,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pallets_status ON public.pallets (status);
CREATE INDEX IF NOT EXISTS idx_pallets_pallet_code ON public.pallets (pallet_code);
CREATE INDEX IF NOT EXISTS idx_pallet_events_created_at ON public.pallet_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_zones_grid_id ON public.zones (grid_id);
CREATE INDEX IF NOT EXISTS idx_zone_inventory_zone_id ON public.zone_inventory (zone_id);

-- ============================================================
-- 4. TRIGGERS
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

CREATE TRIGGER pallet_status_change_trigger
  AFTER UPDATE ON public.pallets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pallet_status_change();

-- ============================================================
-- 5. RPC FUNCTIONS
-- ============================================================

-- UPDATE FROM IOT
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
  PERFORM set_config('app.trigger_source', 'IOT_SENSOR', true);

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

-- RELEASE FROM QA
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
  PERFORM set_config('app.trigger_source', 'QA_SCANNER', true);

  SELECT id INTO v_pallet_id
  FROM public.pallets
  WHERE pallet_code = p_pallet_code;

  IF v_pallet_id IS NULL THEN
    RAISE EXCEPTION 'Pallet dengan kode % tidak ditemukan.', p_pallet_code;
  END IF;

  v_new_status := CASE WHEN p_passed_qa THEN 'OK' ELSE 'UNRELEASED' END;

  INSERT INTO public.qa_inspections (
    pallet_id, pallet_code, document_name,
    avg_voltage, impedance, ai_confidence,
    passed_qa, fail_reason
  ) VALUES (
    v_pallet_id, p_pallet_code, p_document_name,
    p_avg_voltage, p_impedance, p_ai_confidence,
    p_passed_qa, p_fail_reason
  );

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

-- GET AUDIT LOG
CREATE OR REPLACE FUNCTION public.get_audit_log(p_limit INT DEFAULT 50)
RETURNS TABLE (
  event_id        UUID,
  pallet_code     TEXT,
  previous_status TEXT,
  new_status      TEXT,
  trigger_source  TEXT,
  note            TEXT,
  temperature_at_event NUMERIC,
  created_at      TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id, pallet_code, previous_status, new_status,
    trigger_source, note, temperature_at_event, created_at
  FROM public.pallet_events
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- CREATE BUSINESS
CREATE OR REPLACE FUNCTION public.create_business(
  business_name TEXT,
  industry      TEXT,
  tariff        NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.businesses (name, industry_type, energy_tariff_per_kwh)
  VALUES (business_name, industry, tariff)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- GET ZONES WITH INVENTORY
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

GRANT EXECUTE ON FUNCTION public.update_pallet_from_iot(TEXT, NUMERIC, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_pallet_from_qa(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_audit_log(INT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_business(TEXT, TEXT, NUMERIC) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_zones_with_inventory() TO anon, authenticated, service_role;

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.vendors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pallet_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_inspections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_inventory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings  ENABLE ROW LEVEL SECURITY;

-- Anon Access (Public demo)
CREATE POLICY "anon_read_vendors"       ON public.vendors        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_pallets"       ON public.pallets        FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_events"        ON public.pallet_events  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_qa"            ON public.qa_inspections FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_zones"         ON public.zones          FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_zone_inv"      ON public.zone_inventory FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_settings"      ON public.system_settings FOR SELECT TO anon USING (true);

-- Service Role Access (API backend)
CREATE POLICY "service_all_vendors"     ON public.vendors        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_pallets"     ON public.pallets        FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_events"      ON public.pallet_events  FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_qa"          ON public.qa_inspections FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_zones"       ON public.zones          FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_zone_inv"    ON public.zone_inventory FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_settings"    ON public.system_settings FOR ALL TO service_role USING (true);

-- ============================================================
-- 7. SEED DATA
-- ============================================================
INSERT INTO public.vendors (name, country) VALUES
  ('CATL',        'China'),
  ('LG Chem',     'South Korea'),
  ('Panasonic',   'Japan'),
  ('Samsung SDI', 'South Korea')
ON CONFLICT (name) DO NOTHING;

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

INSERT INTO public.system_settings (business_name, industry_segment, energy_tariff_per_kwh, hvac_tolerance_celsius)
VALUES ('PT Sinergi Manufaktur', 'Automotive Parts', 1500.00, 2.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. REALTIME CONFIGURATION
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pallet_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.zone_inventory;
