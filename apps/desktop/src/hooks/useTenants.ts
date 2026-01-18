import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantService, type CreateTenantInput } from "@/services/tenantService";

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: tenantService.list,
  });
};

export const useTenant = (tenantId: string | undefined) => {
  return useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => tenantService.get(tenantId!),
    enabled: !!tenantId,
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantInput) => tenantService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: Partial<CreateTenantInput> }) =>
      tenantService.update(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) => tenantService.delete(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
};
