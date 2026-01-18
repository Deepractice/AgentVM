@registry
Feature: Resource Registry
  Registry manages resources using RXL (Resource eXtensible Locator).
  Resources can be published, resolved, linked, deleted, and searched.

  Background:
    Given the AgentVM server is running
    And I have a client connected to the server

  @publish
  Scenario: Publish a text resource
    When I publish a resource with locator "localhost/sean/hello.text@1.0.0" and content "Hello World"
    Then the response should have a locator "localhost/sean/hello.text@1.0.0"
    And the response type should be "text"
    And the response version should be "1.0.0"

  @publish
  Scenario: Publish a resource with description
    When I publish a resource with locator "localhost/sean/prompt.text@1.0.0" and content "You are helpful" and description "A helpful prompt"
    Then the response should have a locator "localhost/sean/prompt.text@1.0.0"
    And the response description should be "A helpful prompt"

  @resolve
  Scenario: Resolve a published resource
    Given I have published a resource with locator "localhost/sean/greeting.text@1.0.0" and content "Hello"
    When I resolve the resource with locator "localhost/sean/greeting.text@1.0.0"
    Then the response should have content "Hello"

  @resolve
  Scenario: Resolve a non-existent resource
    When I resolve a resource with locator "localhost/nobody/missing.text@1.0.0"
    Then the request should fail with status 404

  @exists
  Scenario: Check if resource exists
    Given I have published a resource with locator "localhost/sean/check.text@1.0.0" and content "exists"
    When I check if resource exists with locator "localhost/sean/check.text@1.0.0"
    Then the response should indicate the resource exists

  @exists
  Scenario: Check if non-existent resource exists
    When I check if resource exists with locator "localhost/nobody/missing.text@1.0.0"
    Then the response should indicate the resource does not exist

  @search
  Scenario: Search resources by type
    Given I have published a resource with locator "localhost/sean/a.text@1.0.0" and content "A"
    And I have published a resource with locator "localhost/sean/b.text@1.0.0" and content "B"
    And I have published a resource with locator "localhost/sean/c.json@1.0.0" and content "{}"
    When I search for resources with type "text"
    Then the response should contain 2 items

  @search
  Scenario: Search resources by domain
    Given I have published a resource with locator "localhost/sean/local.text@1.0.0" and content "local"
    And I have published a resource with locator "example.com/user/remote.text@1.0.0" and content "remote"
    When I search for resources with domain "localhost"
    Then the response should contain 1 item

  @delete
  Scenario: Delete a resource
    Given I have published a resource with locator "localhost/sean/todelete.text@1.0.0" and content "delete me"
    When I delete the resource with locator "localhost/sean/todelete.text@1.0.0"
    Then the deletion should succeed

  @delete
  Scenario: Delete a non-existent resource
    When I delete a resource with locator "localhost/nobody/missing.text@1.0.0"
    Then the request should fail with status 404
