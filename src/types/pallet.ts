// Status sesuai CHECK constraint di tabel pallets:
// OK = aman | ON HOLD = perlu inspeksi | REJECT = karantina | UNRELEASED = menunggu QA
export type PalletStatus = "OK" | "ON HOLD" | "REJECT" | "UNRELEASED";

export interface Pallet {
  id: string;
  pallet_code: string;
  temperature: number;
  humidity: number | null;
  status: PalletStatus;
  location: string;
  cell_count: number;
  vendor_name: string;   // Sesuai kolom DB: vendor_name (bukan vendor)
  last_updated: string;
  alert_reason?: string | null;
}
