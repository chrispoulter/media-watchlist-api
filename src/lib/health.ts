export interface HealthcheckResult {
  service: string;
  success: boolean;
  error?: string;
}
