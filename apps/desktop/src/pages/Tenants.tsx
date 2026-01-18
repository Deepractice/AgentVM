import { useState, useEffect } from "react";
import { client, type Tenant } from "@/api/client";

function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTenantName, setNewTenantName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const list = await client.tenant.list();
      setTenants(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    try {
      setCreating(true);
      await client.tenant.create({ name: newTenantName.trim() });
      setNewTenantName("");
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tenant");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tenantId: string) => {
    try {
      await client.tenant.delete({ tenantId });
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tenant");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tenants</h2>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTenantName}
          onChange={(e) => setNewTenantName(e.target.value)}
          placeholder="New tenant name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={creating || !newTenantName.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Tenant"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}

      {/* Tenant list */}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : tenants.length === 0 ? (
        <div className="text-gray-500">No tenants yet. Create one above.</div>
      ) : (
        <div className="space-y-2">
          {tenants.map((tenant) => (
            <div
              key={tenant.tenantId}
              className="p-4 bg-white rounded-lg border border-gray-200 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium text-gray-800">{tenant.name}</h3>
                <p className="text-sm text-gray-500">{tenant.tenantId}</p>
              </div>
              <button
                onClick={() => handleDelete(tenant.tenantId)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TenantsPage;
