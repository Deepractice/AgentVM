/**
 * Registry Step Definitions
 *
 * End-to-end tests for resource registry using the AgentVM Client.
 */

import { Given, When, Then, Before } from "@cucumber/cucumber";
import { strict as assert } from "assert";
import {
  createHttpApp,
  createClient,
  type AvmClient,
  type Resource,
  type ResolveResourceResponse,
  type ResourceListResponse,
  type ExistsResponse,
  type DeleteResourceResponse,
} from "agentvm";

interface RegistryWorld {
  app: ReturnType<typeof createHttpApp>;
  client: AvmClient;
  response?:
    | Resource
    | ResolveResourceResponse
    | ResourceListResponse
    | ExistsResponse
    | DeleteResourceResponse
    | null;
  error?: Error;
  lastLocator?: string;
}

Before({ tags: "@registry" }, function (this: RegistryWorld) {
  // Create a fresh app and client for each scenario
  this.app = createHttpApp({ dbPath: ":memory:", logging: false });
  this.client = createClient({
    baseUrl: "",
    fetch: (url, options) => this.app.request(url as string, options),
  });
  this.response = undefined;
  this.error = undefined;
  this.lastLocator = undefined;
});

// === Given steps ===
// Note: "the AgentVM server is running" and "I have a client connected to the server"
// are defined in common.steps.ts

Given(
  "I have published a resource with locator {string} and content {string}",
  async function (this: RegistryWorld, locator: string, content: string) {
    await this.client.registry.publish({ locator, content });
    this.lastLocator = locator;
  }
);

// === When steps ===

When(
  "I publish a resource with locator {string} and content {string}",
  async function (this: RegistryWorld, locator: string, content: string) {
    this.response = await this.client.registry.publish({ locator, content });
    this.lastLocator = locator;
  }
);

When(
  "I publish a resource with locator {string} and content {string} and description {string}",
  async function (this: RegistryWorld, locator: string, content: string, description: string) {
    this.response = await this.client.registry.publish({ locator, content, description });
    this.lastLocator = locator;
  }
);

When(
  "I resolve the resource with locator {string}",
  async function (this: RegistryWorld, locator: string) {
    try {
      this.response = await this.client.registry.resolve({ locator });
    } catch (err) {
      this.error = err as Error;
    }
  }
);

When(
  "I resolve a resource with locator {string}",
  async function (this: RegistryWorld, locator: string) {
    try {
      this.response = await this.client.registry.resolve({ locator });
    } catch (err) {
      this.error = err as Error;
    }
  }
);

When(
  "I check if resource exists with locator {string}",
  async function (this: RegistryWorld, locator: string) {
    this.response = await this.client.registry.exists({ locator });
  }
);

When(
  "I search for resources with type {string}",
  async function (this: RegistryWorld, type: string) {
    this.response = await this.client.registry.search({ type });
  }
);

When(
  "I search for resources with domain {string}",
  async function (this: RegistryWorld, domain: string) {
    this.response = await this.client.registry.search({ domain });
  }
);

When(
  "I delete the resource with locator {string}",
  async function (this: RegistryWorld, locator: string) {
    try {
      this.response = await this.client.registry.delete({ locator });
    } catch (err) {
      this.error = err as Error;
    }
  }
);

When(
  "I delete a resource with locator {string}",
  async function (this: RegistryWorld, locator: string) {
    try {
      this.response = await this.client.registry.delete({ locator });
    } catch (err) {
      this.error = err as Error;
    }
  }
);

// === Then steps ===

Then(
  "the response should have a locator {string}",
  function (this: RegistryWorld, locator: string) {
    assert(this.response, "No response");
    assert("locator" in this.response, "Response should have locator");
    assert.equal((this.response as Resource).locator, locator);
  }
);

Then("the response type should be {string}", function (this: RegistryWorld, type: string) {
  assert(this.response, "No response");
  assert("type" in this.response, "Response should have type");
  assert.equal((this.response as Resource).type, type);
});

Then("the response version should be {string}", function (this: RegistryWorld, version: string) {
  assert(this.response, "No response");
  assert("version" in this.response, "Response should have version");
  assert.equal((this.response as Resource).version, version);
});

// Note: "the response description should be" is defined in common.steps.ts

Then("the response should have content {string}", function (this: RegistryWorld, content: string) {
  assert(this.response, "No response");
  assert("content" in this.response, "Response should have content");
  assert.equal((this.response as ResolveResourceResponse).content, content);
});

Then("the response should indicate the resource exists", function (this: RegistryWorld) {
  assert(this.response, "No response");
  assert("exists" in this.response, "Response should have exists property");
  assert.equal((this.response as ExistsResponse).exists, true);
});

Then("the response should indicate the resource does not exist", function (this: RegistryWorld) {
  assert(this.response, "No response");
  assert("exists" in this.response, "Response should have exists property");
  assert.equal((this.response as ExistsResponse).exists, false);
});

Then("the response should contain {int} items", function (this: RegistryWorld, count: number) {
  assert(this.response, "No response");
  assert("items" in this.response, "Response should have items");
  assert.equal((this.response as ResourceListResponse).items.length, count);
});

Then("the response should contain {int} item", function (this: RegistryWorld, count: number) {
  assert(this.response, "No response");
  assert("items" in this.response, "Response should have items");
  assert.equal((this.response as ResourceListResponse).items.length, count);
});

// Note: "the deletion should succeed" and "the request should fail with status"
// are defined in common.steps.ts
