import { client } from "@/api/client";
import type { Tenant } from "agentvm/client";

export interface CreateTenantInput {
  name: string;
  description?: string;
}

export const tenantService = {
  list: (): Promise<Tenant[]> => client.tenant.list(),

  get: (tenantId: string): Promise<Tenant | null> => client.tenant.get({ tenantId }),

  create: (data: CreateTenantInput): Promise<Tenant> => client.tenant.create(data),

  update: (tenantId: string, data: Partial<CreateTenantInput>): Promise<Tenant | null> =>
    client.tenant.update({ tenantId, ...data }),

  delete: (tenantId: string): Promise<boolean> =>
    client.tenant.delete({ tenantId }).then(() => true),
};
