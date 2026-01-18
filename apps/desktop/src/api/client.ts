import { createClient, type AvmClient, type Tenant } from "agentvm/client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const client: AvmClient = createClient({
  baseUrl: API_BASE,
});

export type { Tenant };
