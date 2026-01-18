import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
import { useAppStore } from "@/stores/app";
import { useTenants, useCreateTenant, useDeleteTenant } from "@/hooks/useTenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TenantSwitcher() {
  const { currentTenant, setCurrentTenant, closeTenantSwitcher } = useAppStore();
  const { data: tenants, isLoading } = useTenants();
  const createTenant = useCreateTenant();
  const deleteTenant = useDeleteTenant();

  const [newTenantName, setNewTenantName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSelect = (tenant: typeof currentTenant) => {
    setCurrentTenant(tenant);
    closeTenantSwitcher();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    try {
      const newTenant = await createTenant.mutateAsync({ name: newTenantName.trim() });
      setNewTenantName("");
      setIsCreating(false);
      setCurrentTenant(newTenant);
      closeTenantSwitcher();
    } catch (err) {
      console.error("Failed to create tenant:", err);
    }
  };

  const handleDelete = async (tenantId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("确定删除这个租户吗？")) return;

    try {
      await deleteTenant.mutateAsync(tenantId);
      if (currentTenant?.tenantId === tenantId) {
        setCurrentTenant(null);
      }
    } catch (err) {
      console.error("Failed to delete tenant:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-xl w-96 max-h-[80vh] flex flex-col shadow-xl border border-[var(--border-light)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
          <h2 className="text-base font-medium text-[var(--text-primary)]">切换租户</h2>
          <button
            onClick={closeTenantSwitcher}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tenant List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-[var(--text-muted)] text-center py-4">加载中...</div>
          ) : tenants?.length === 0 ? (
            <div className="text-[var(--text-muted)] text-center py-4">暂无租户，请创建一个</div>
          ) : (
            <div className="space-y-1">
              {tenants?.map((tenant) => (
                <div
                  key={tenant.tenantId}
                  onClick={() => handleSelect(tenant)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                    currentTenant?.tenantId === tenant.tenantId
                      ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentTenant?.tenantId === tenant.tenantId && (
                      <Check className="w-4 h-4 text-[var(--accent-success)]" />
                    )}
                    <span>{tenant.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(tenant.tenantId, e)}
                    className="text-[var(--text-muted)] hover:text-[var(--accent-error)] opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Form */}
        <div className="border-t border-[var(--border-light)] p-3">
          {isCreating ? (
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                placeholder="租户名称"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={createTenant.isPending}>
                {createTenant.isPending ? "..." : "创建"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                取消
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              创建新租户
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
