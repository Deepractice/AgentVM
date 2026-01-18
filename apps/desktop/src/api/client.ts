import { createClient, type AvmClient } from "@agentvm/avm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const client: AvmClient = createClient({
  baseUrl: API_BASE,
});

export { type Tenant, type DeleteResponse } from "@agentvm/avm";
