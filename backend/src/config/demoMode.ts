/**
 * Demo mode: when true, API returns dummy data so the UI is never empty.
 * Set DEMO_MODE=true in .env to enable. Admin/developer can toggle for demos.
 */
export function isDemoMode(): boolean {
  const v = process.env.DEMO_MODE;
  return v === 'true' || v === '1' || v === 'yes';
}
