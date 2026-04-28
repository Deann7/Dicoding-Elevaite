-- ============================================================
-- ELEVAITE VOLT-GUARD: RPC Functions & Helper Procedures
-- Run this AFTER main.sql
-- ============================================================

-- ============================================================
-- RPC 1: update_pallet_status_from_iot
-- Dipanggil oleh API route /api/iot/update
-- Memperbarui suhu, humidity, dan otomatis menentukan status
-- berdasarkan threshold yang sudah ditentukan.
-- Mengembalikan baris palet yang sudah diperbarui.
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
-- RPC 2: release_pallet_from_qa
-- Dipanggil oleh API route /api/qa/release setelah AI Scanner
-- menyelesaikan ekstraksi dokumen dan hasilnya lulus QA.
-- Mengubah status palet dari UNRELEASED menjadi OK,
-- sekaligus mencatat hasil scan ke tabel qa_inspections.
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
  -- Ambil ID palet
  SELECT id INTO v_pallet_id
  FROM public.pallets
  WHERE pallet_code = p_pallet_code;

  -- Tentukan status baru berdasarkan hasil QA
  v_new_status := CASE WHEN p_passed_qa THEN 'OK' ELSE 'ON HOLD' END;

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

GRANT EXECUTE ON FUNCTION public.release_pallet_from_qa(TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, BOOLEAN, TEXT) TO service_role;

-- ============================================================
-- RPC 3: get_audit_log
-- Dipanggil oleh halaman Audit Logs untuk menampilkan
-- semua perubahan status palet secara kronologis.
-- ============================================================
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

GRANT EXECUTE ON FUNCTION public.get_audit_log(INT) TO anon, authenticated, service_role;

-- ============================================================
-- RPC (Legacy dari versi sebelumnya — dipertahankan untuk kompatibilitas)
-- create_business: membuat bisnis saat registrasi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT    NOT NULL,
  industry_type       TEXT    NOT NULL DEFAULT 'Manufaktur EV',
  energy_tariff_per_kwh NUMERIC(10,4) DEFAULT 1.44,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

GRANT EXECUTE ON FUNCTION public.create_business(TEXT, TEXT, NUMERIC) TO anon, authenticated;
