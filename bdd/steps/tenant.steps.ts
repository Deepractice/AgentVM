import { Given, When, Then, Before } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import type { Tenant, TenantRepository, CreateTenantRequest } from "@agentvm/core";
import { SQLiteTenantRepository } from "@agentvm/avm";

interface TenantWorld {
  repository: TenantRepository;
  createdTenant?: Tenant;
  foundTenant?: Tenant | null;
  updatedTenant?: Tenant | null;
  deleteResult?: boolean;
  tenantList?: Tenant[];
  existingTenantId?: string;
}

Before(function (this: TenantWorld) {
  // Clean state before each scenario
  this.createdTenant = undefined;
  this.foundTenant = undefined;
  this.updatedTenant = undefined;
  this.deleteResult = undefined;
  this.tenantList = undefined;
  this.existingTenantId = undefined;
});

// Given steps

Given("a tenant repository", async function (this: TenantWorld) {
  // Use in-memory SQLite for testing
  this.repository = new SQLiteTenantRepository(":memory:");
});

Given("a tenant exists with name {string}", async function (this: TenantWorld, name: string) {
  const tenant = await this.repository.create({ name });
  this.existingTenantId = tenant.tenantId;
});

// When steps

When("I create a tenant with name {string}", async function (this: TenantWorld, name: string) {
  this.createdTenant = await this.repository.create({ name });
});

When(
  "I create a tenant with name {string} and description {string}",
  async function (this: TenantWorld, name: string, description: string) {
    this.createdTenant = await this.repository.create({ name, description });
  }
);

When("I find the tenant by its ID", async function (this: TenantWorld) {
  assert(this.existingTenantId, "No existing tenant ID");
  this.foundTenant = await this.repository.findById(this.existingTenantId);
});

When("I find a tenant with ID {string}", async function (this: TenantWorld, tenantId: string) {
  this.foundTenant = await this.repository.findById(tenantId);
});

When("I update the tenant name to {string}", async function (this: TenantWorld, name: string) {
  assert(this.existingTenantId, "No existing tenant ID");
  this.updatedTenant = await this.repository.update(this.existingTenantId, { name });
});

When(
  "I update the tenant description to {string}",
  async function (this: TenantWorld, description: string) {
    assert(this.existingTenantId, "No existing tenant ID");
    this.updatedTenant = await this.repository.update(this.existingTenantId, { description });
  }
);

When("I delete the tenant", async function (this: TenantWorld) {
  assert(this.existingTenantId, "No existing tenant ID");
  this.deleteResult = await this.repository.delete(this.existingTenantId);
});

When("I delete a tenant with ID {string}", async function (this: TenantWorld, tenantId: string) {
  this.deleteResult = await this.repository.delete(tenantId);
});

When("I list all tenants", async function (this: TenantWorld) {
  this.tenantList = await this.repository.list();
});

// Then steps

Then("the tenant should be created", function (this: TenantWorld) {
  assert(this.createdTenant, "Tenant was not created");
});

Then("the tenant should have name {string}", function (this: TenantWorld, name: string) {
  const tenant = this.createdTenant || this.foundTenant || this.updatedTenant;
  assert(tenant, "No tenant to check");
  assert.equal(tenant.name, name);
});

Then(
  "the tenant should have description {string}",
  function (this: TenantWorld, description: string) {
    const tenant = this.createdTenant || this.foundTenant || this.updatedTenant;
    assert(tenant, "No tenant to check");
    assert.equal(tenant.description, description);
  }
);

Then("the tenant should have a generated tenantId", function (this: TenantWorld) {
  assert(this.createdTenant, "No created tenant");
  assert(this.createdTenant.tenantId, "tenantId is missing");
  assert(this.createdTenant.tenantId.length > 0, "tenantId is empty");
});

Then("the tenant should have createdAt timestamp", function (this: TenantWorld) {
  assert(this.createdTenant, "No created tenant");
  assert(typeof this.createdTenant.createdAt === "number", "createdAt is not a number");
  assert(this.createdTenant.createdAt > 0, "createdAt is not positive");
});

Then("the tenant should have updatedAt timestamp", function (this: TenantWorld) {
  assert(this.createdTenant, "No created tenant");
  assert(typeof this.createdTenant.updatedAt === "number", "updatedAt is not a number");
  assert(this.createdTenant.updatedAt > 0, "updatedAt is not positive");
});

Then("the tenant should be found", function (this: TenantWorld) {
  assert(this.foundTenant, "Tenant was not found");
});

Then("the tenant should not be found", function (this: TenantWorld) {
  assert(this.foundTenant === null, "Tenant should not be found");
});

Then("the tenant should be updated", function (this: TenantWorld) {
  assert(this.updatedTenant, "Tenant was not updated");
});

Then("the tenant updatedAt should be changed", function (this: TenantWorld) {
  assert(this.updatedTenant, "No updated tenant");
  // updatedAt should be recent (within last second)
  const now = Date.now();
  assert(this.updatedTenant.updatedAt <= now, "updatedAt is in the future");
  assert(this.updatedTenant.updatedAt > now - 1000, "updatedAt is too old");
});

Then("the deletion should succeed", function (this: TenantWorld) {
  assert.equal(this.deleteResult, true, "Deletion should succeed");
});

Then("the deletion should fail", function (this: TenantWorld) {
  assert.equal(this.deleteResult, false, "Deletion should fail");
});

Then("the tenant should no longer exist", async function (this: TenantWorld) {
  assert(this.existingTenantId, "No existing tenant ID");
  const tenant = await this.repository.findById(this.existingTenantId);
  assert(tenant === null, "Tenant should no longer exist");
});

Then("I should get {int} tenants", function (this: TenantWorld, count: number) {
  assert(this.tenantList, "No tenant list");
  assert.equal(this.tenantList.length, count, `Expected ${count} tenants`);
});
