/**
 * Cucumber World configuration
 */

import { setWorldConstructor, setDefaultTimeout } from "@cucumber/cucumber";

// Default timeout for steps
setDefaultTimeout(30000);

// World constructor (can add shared state here if needed)
class CustomWorld {
  // Add shared properties/methods here
}

setWorldConstructor(CustomWorld);
