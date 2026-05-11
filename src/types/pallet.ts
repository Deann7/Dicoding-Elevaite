export type PalletStatus = "OK" | "ON HOLD" | "REJECT" | "UNRELEASED";

export interface Pallet {
  id: string;
  pallet_code: string;
  temperature: number;
  humidity: number | null;
  status: PalletStatus;
  location: string;
  cell_count: number;
  vendor_name: string;
  last_updated: string;
  alert_reason?: string | null;
}
