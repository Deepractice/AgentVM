@tenant
Feature: Tenant Management
  Tenant is the core isolation unit in AgentVM.
  Each tenant has isolated resources, agents, and configurations.

  Background:
    Given the AgentVM server is running
    And I have a client connected to the server

  @create
  Scenario: Create a new tenant
    When I create a tenant with name "My App"
    Then the response should have a tenantId
    And the response name should be "My App"

  @create
  Scenario: Create a tenant with description
    When I create a tenant with name "My App" and description "Test application"
    Then the response should have a tenantId
    And the response name should be "My App"
    And the response description should be "Test application"

  @get
  Scenario: Get a tenant by ID
    Given I have created a tenant with name "Find Me"
    When I get the tenant by ID
    Then the response name should be "Find Me"

  @get
  Scenario: Get a non-existent tenant
    When I get a tenant with ID "tenant_nonexistent"
    Then the request should fail with status 404

  @list
  Scenario: List all tenants
    Given I have created a tenant with name "Tenant A"
    And I have created a tenant with name "Tenant B"
    And I have created a tenant with name "Tenant C"
    When I list all tenants
    Then the response should be an array with at least 3 items

  @list
  Scenario: List tenants when empty
    When I list all tenants
    Then the response should be an empty array

  @update
  Scenario: Update tenant name
    Given I have created a tenant with name "Old Name"
    When I update the tenant name to "New Name"
    Then the response name should be "New Name"

  @update
  Scenario: Update tenant description
    Given I have created a tenant with name "My App"
    When I update the tenant description to "Updated description"
    Then the response description should be "Updated description"

  @update
  Scenario: Update a non-existent tenant
    When I update a tenant with ID "tenant_nonexistent" with name "New Name"
    Then the request should fail with status 404

  @delete
  Scenario: Delete a tenant
    Given I have created a tenant with name "To Delete"
    When I delete the tenant
    Then the deletion should succeed

  @delete
  Scenario: Delete a non-existent tenant
    When I delete a tenant with ID "tenant_nonexistent"
    Then the request should fail with status 404
