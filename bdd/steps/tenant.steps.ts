/**
 * Tenant Step Definitions
 *
 * End-to-end tests using the AgentVM Client.
 */

import { Given, When, Then, Before } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import {
  createHttpApp,
  createClient,
  type AvmClient,
  type Tenant,
  type DeleteResponse,
} from "agentvm";

interface TenantWorld {
  app: ReturnType<typeof createHttpApp>;
  client: AvmClient;
  response?: Tenant | Tenant[] | DeleteResponse | null;
  error?: Error;
  lastTenantId?: string;
}

Before({ tags: "@tenant" }, function (this: TenantWorld) {
  // Create a fresh app and client for each scenario
  this.app = createHttpApp({ dbPath: ":memory:", logging: false });
  this.client = createClient({
    baseUrl: "",
    fetch: (url, options) => this.app.request(url as string, options),
  });
  this.response = undefined;
  this.error = undefined;
  this.lastTenantId = undefined;
});

// === Given steps ===

Given("the AgentVM server is running", function (this: TenantWorld) {
  assert(this.app, "App should be initialized");
});

Given("I have a client connected to the server", function (this: TenantWorld) {
  assert(this.client, "Client should be initialized");
});

Given(
  "I have created a tenant with name {string}",
  async function (this: TenantWorld, name: string) {
    const tenant = await this.client.tenant.create({ name });
    this.lastTenantId = tenant.tenantId;
  }
);

// === When steps ===

When("I create a tenant with name {string}", async function (this: TenantWorld, name: string) {
  this.response = await this.client.tenant.create({ name });
  if (this.response && "tenantId" in this.response) {
    this.lastTenantId = this.response.tenantId;
  }
});

When(
  "I create a tenant with name {string} and description {string}",
  async function (this: TenantWorld, name: string, description: string) {
    this.response = await this.client.tenant.create({ name, description });
    if (this.response && "tenantId" in this.response) {
      this.lastTenantId = this.response.tenantId;
    }
  }
);

When("I get the tenant by ID", async function (this: TenantWorld) {
  assert(this.lastTenantId, "No tenant ID available");
  this.response = await this.client.tenant.get({ tenantId: this.lastTenantId });
});

When("I get a tenant with ID {string}", async function (this: TenantWorld, tenantId: string) {
  try {
    this.response = await this.client.tenant.get({ tenantId });
  } catch (err) {
    this.error = err as Error;
  }
});

When("I list all tenants", async function (this: TenantWorld) {
  this.response = await this.client.tenant.list();
});

When("I update the tenant name to {string}", async function (this: TenantWorld, name: string) {
  assert(this.lastTenantId, "No tenant ID available");
  this.response = await this.client.tenant.update({
    tenantId: this.lastTenantId,
    name,
  });
});

When(
  "I update the tenant description to {string}",
  async function (this: TenantWorld, description: string) {
    assert(this.lastTenantId, "No tenant ID available");
    this.response = await this.client.tenant.update({
      tenantId: this.lastTenantId,
      description,
    });
  }
);

When(
  "I update a tenant with ID {string} with name {string}",
  async function (this: TenantWorld, tenantId: string, name: string) {
    try {
      this.response = await this.client.tenant.update({ tenantId, name });
    } catch (err) {
      this.error = err as Error;
    }
  }
);

When("I delete the tenant", async function (this: TenantWorld) {
  assert(this.lastTenantId, "No tenant ID available");
  this.response = await this.client.tenant.delete({ tenantId: this.lastTenantId });
});

When("I delete a tenant with ID {string}", async function (this: TenantWorld, tenantId: string) {
  try {
    this.response = await this.client.tenant.delete({ tenantId });
  } catch (err) {
    this.error = err as Error;
  }
});

// === Then steps ===

Then("the response should have a tenantId", function (this: TenantWorld) {
  assert(this.response, "No response");
  assert(
    typeof this.response === "object" && "tenantId" in this.response,
    "Response should have tenantId"
  );
});

Then("the response name should be {string}", function (this: TenantWorld, name: string) {
  assert(this.response, "No response");
  assert(typeof this.response === "object" && "name" in this.response, "Response should have name");
  assert.equal((this.response as Tenant).name, name);
});

Then(
  "the response description should be {string}",
  function (this: TenantWorld, description: string) {
    assert(this.response, "No response");
    assert(
      typeof this.response === "object" && "description" in this.response,
      "Response should have description"
    );
    assert.equal((this.response as Tenant).description, description);
  }
);

Then(
  "the response should be an array with at least {int} items",
  function (this: TenantWorld, minItems: number) {
    assert(this.response, "No response");
    assert(Array.isArray(this.response), "Response should be an array");
    assert(
      this.response.length >= minItems,
      `Expected at least ${minItems} items, got ${this.response.length}`
    );
  }
);

Then("the response should be an empty array", function (this: TenantWorld) {
  assert(this.response, "No response");
  assert(Array.isArray(this.response), "Response should be an array");
  assert.equal(this.response.length, 0, "Response should be empty");
});

Then("the deletion should succeed", function (this: TenantWorld) {
  assert(this.response, "No response");
  assert(
    typeof this.response === "object" && "deleted" in this.response,
    "Response should have deleted property"
  );
  assert.equal((this.response as DeleteResponse).deleted, true);
});

Then("the request should fail with status {int}", function (this: TenantWorld, status: number) {
  assert(this.error, "Expected an error");
  assert(
    this.error.message.includes(`HTTP ${status}`),
    `Expected HTTP ${status} error, got: ${this.error.message}`
  );
});
