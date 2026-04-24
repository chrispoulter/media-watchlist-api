export interface HealthcheckResult {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
}
