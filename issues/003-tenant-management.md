# 003 - Tenant Management

## Background

Tenant is the core isolation unit in AgentVM, mapping to AgentX Container.

This is the first feature following the **Core/Platform separation** principle:

- `@agentvm/core`: Types + TenantRepository interface
- `@agentvm/avm`: SQLiteTenantRepository implementation

---

## Tenant Entity (MVP)

```typescript
interface Tenant {
  tenantId: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
```

Minimal fields only. Extensions (containerId, apiKey, quota, usage) will be added later.

---

## TenantRepository Interface

```typescript
interface TenantRepository {
  create(request: CreateTenantRequest): Promise<Tenant>;
  findById(tenantId: string): Promise<Tenant | null>;
  update(tenantId: string, request: UpdateTenantRequest): Promise<Tenant | null>;
  delete(tenantId: string): Promise<boolean>;
  list(): Promise<Tenant[]>;
}

interface CreateTenantRequest {
  name: string;
  description?: string;
}

interface UpdateTenantRequest {
  name?: string;
  description?: string;
}
```

---

## Implementation Plan

### Phase 1: Core Types and Interface

```
packages/core/src/
├── tenant/
│   ├── types.ts           # Tenant, CreateTenantRequest, UpdateTenantRequest
│   └── TenantRepository.ts # interface TenantRepository
└── index.ts               # export all
```

### Phase 2: AVM Implementation

```
packages/avm/src/
├── repositories/
│   └── SQLiteTenantRepository.ts  # implements TenantRepository
└── index.ts
```

### Phase 3: HTTP API (later)

```
POST   /v1/tenants          # create
GET    /v1/tenants          # list
GET    /v1/tenants/:id      # findById
PUT    /v1/tenants/:id      # update
DELETE /v1/tenants/:id      # delete
```

---

## Acceptance Criteria

- [ ] Tenant types defined in core
- [ ] TenantRepository interface defined in core
- [ ] SQLiteTenantRepository implemented in avm
- [ ] BDD tests pass
- [ ] Core has zero platform dependencies
