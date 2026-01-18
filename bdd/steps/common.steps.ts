/**
 * Common Step Definitions
 *
 * Shared step definitions used across multiple features.
 */

import { Given, Then } from "@cucumber/cucumber";
import { strict as assert } from "assert";

// Common world interface properties
interface CommonWorld {
  app: unknown;
  client: unknown;
  response?: unknown;
  error?: Error;
}

// === Common Given steps ===

Given("the AgentVM server is running", function (this: CommonWorld) {
  assert(this.app, "App should be initialized");
});

Given("I have a client connected to the server", function (this: CommonWorld) {
  assert(this.client, "Client should be initialized");
});

// === Common Then steps ===

Then("the request should fail with status {int}", function (this: CommonWorld, status: number) {
  assert(this.error, "Expected an error");
  assert(
    this.error.message.includes(`HTTP ${status}`),
    `Expected HTTP ${status} error, got: ${this.error.message}`
  );
});

Then("the deletion should succeed", function (this: CommonWorld) {
  assert(this.response, "No response");
  const response = this.response as { deleted?: boolean };
  assert("deleted" in response, "Response should have deleted property");
  assert.equal(response.deleted, true);
});

Then(
  "the response description should be {string}",
  function (this: CommonWorld, description: string) {
    assert(this.response, "No response");
    const response = this.response as { description?: string };
    assert("description" in response, "Response should have description");
    assert.equal(response.description, description);
  }
);
