/**
 * Cucumber.js configuration for AgentVM
 *
 * Usage:
 *   bun test:bdd                        # All tests (excluding @pending)
 *   bun test:bdd --tags @agents         # Only agent tests
 *   bun test:bdd --tags @sessions       # Only session tests
 *   bun test:bdd --tags "not @pending"  # Exclude pending tests
 */

export default {
  format: ["progress-bar", "html:reports/cucumber-report.html"],
  formatOptions: { snippetInterface: "async-await" },
  import: ["support/**/*.ts", "steps/**/*.ts"],
  paths: ["features/**/*.feature"],
  tags: "not @pending",
  worldParameters: {
    defaultTimeout: 30000,
  },
};
