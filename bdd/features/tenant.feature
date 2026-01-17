@tenant
Feature: Tenant Management
  Tenant is the core isolation unit in AgentVM.

  @create
  Scenario: Create a new tenant
    Given a tenant repository
    When I create a tenant with name "My App"
    Then the tenant should be created
    And the tenant should have name "My App"
    And the tenant should have a generated tenantId
    And the tenant should have createdAt timestamp
    And the tenant should have updatedAt timestamp

  @create
  Scenario: Create a tenant with description
    Given a tenant repository
    When I create a tenant with name "My App" and description "Test application"
    Then the tenant should be created
    And the tenant should have name "My App"
    And the tenant should have description "Test application"

  @findById
  Scenario: Find tenant by ID
    Given a tenant repository
    And a tenant exists with name "Existing App"
    When I find the tenant by its ID
    Then the tenant should be found
    And the tenant should have name "Existing App"

  @findById
  Scenario: Find non-existent tenant
    Given a tenant repository
    When I find a tenant with ID "non-existent-id"
    Then the tenant should not be found

  @update
  Scenario: Update tenant name
    Given a tenant repository
    And a tenant exists with name "Old Name"
    When I update the tenant name to "New Name"
    Then the tenant should be updated
    And the tenant should have name "New Name"
    And the tenant updatedAt should be changed

  @update
  Scenario: Update tenant description
    Given a tenant repository
    And a tenant exists with name "My App"
    When I update the tenant description to "Updated description"
    Then the tenant should be updated
    And the tenant should have description "Updated description"

  @delete
  Scenario: Delete a tenant
    Given a tenant repository
    And a tenant exists with name "To Delete"
    When I delete the tenant
    Then the deletion should succeed
    And the tenant should no longer exist

  @delete
  Scenario: Delete non-existent tenant
    Given a tenant repository
    When I delete a tenant with ID "non-existent-id"
    Then the deletion should fail

  @list
  Scenario: List all tenants
    Given a tenant repository
    And a tenant exists with name "App 1"
    And a tenant exists with name "App 2"
    And a tenant exists with name "App 3"
    When I list all tenants
    Then I should get 3 tenants

  @list
  Scenario: List tenants when empty
    Given a tenant repository
    When I list all tenants
    Then I should get 0 tenants
