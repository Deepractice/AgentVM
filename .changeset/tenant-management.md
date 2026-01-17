---
"@agentvm/core": minor
"@agentvm/avm": minor
---

feat: add Tenant management

- Add Tenant types and TenantRepository interface in @agentvm/core
- Implement SQLiteTenantRepository with Drizzle ORM in @agentvm/avm
- Add BDD tests for Tenant CRUD operations
- Establish Core/Platform separation architecture
