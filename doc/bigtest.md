# Getting Started with BigTest in Stripes

- [Infrastructure Setup](#infrastructure-setup)
	- [For New Apps](#for-new-apps)
	- [For Existing Apps](#for-existing-apps)
- [Running with Mirage](#running-with-mirage)
	- [BigTest Mirage](#bigtest-mirage)
	- [Defining Data](#defining-data)
	- [Scenarios](#scenarios)
- [Writing Tests](#writing-tests)
	- [Arrange-Act-Assert](#arrange-act-assert)
	- [Application Setup](#application-setup)
	- [Interactors](#interactors)
	- [Convergent Assertions](#convergent-assertions)
- [Running Tests](#running-tests)
	- [Karma](#karma)
	- [Browser Support](#browser-support)
	- [Coverage](#coverage)
	- [Continuous Integration](#continuous-integration)

## Infrastructure Setup

Setting up BigTest directory infrastructure and accompanying files is made easy
via [`stripes-cli`](https://github.com/folio-org/stripes-cli).

### For New Apps

For quickly getting started, the directory structure, necessary files, and
dependencies are automatically included in Stripes CLI's `stripes app create`
command.

### For Existing Apps

BigTest specific files in the Stripes ecosystem are located in
`test/bigtest`. These files can be quickly copied into an existing project by
using the `stripes app bigtest` command from Stripes CLI. This command will also
automatically add the recommended dependencies via `yarn add`. If you wish to
add the dependencies yourself, you may provide a `--no-install` flag to the
command.

## Running with Mirage

Mirage is used to mock the network layer and provide auto-generated fixture data
based on models and factories.  In testing, this is especially useful for
rendering data with specific conditions. In development, this can be used to
develop features locally without needing an external server, or having to
stand-up your own local server instance.

To start the app with Mirage enabled, provide the `--mirage` flag to `stripes
serve`. When starting with Mirage enabled, the fake user the login endpoint
provides does not come with any default permissions. Until those permissions are
explicitly defined, you'll also need to start with the `--hasAllPerms` flag.

```bash
$ stripes serve --hasAllPerms --mirage
```

Once the app has been started with Mirage enabled, all endpoints will be
captured by Mirage. Errors will be logged to the console when there are
unhandled endpoints. Once you have some endpoints defined, Mirage will log their
responses to the console for debugging. You can also interact directly with the
Mirage server by using `window.mirage`.

### BigTest Mirage

BigTest's Mirage is a fork of the original [Ember CLI
Mirage](https://www.ember-cli-mirage.com) decoupled from the Ember
framework. The following section will go over some basics and link out to the
original documentation since it is still the best place to learn about the
Mirage API. However, keep in mind a few subtle differences between
`ember-cli-mirage` and `@bigtest/mirage`.

First, any imports will be from `@bigtest/mirage` instead of `ember-cli-mirage`:

```js
// according to documentation
import { Model } from 'ember-cli-mirage';

// corrected using bigtest
import { Model } from '@bigtest/mirage';
```

Second, the directory structure referenced in the documentation refers to a
`mirage` directory. But with BigTest, network files are located in the
`bigtest/network` directory:

```js
// documented
// mirage/config.js

// corrected
// test/bigtest/network/config.js
```

Last, Ember CLI Mirage was meant to work in tandem with Ember CLI. Therefore
there are many references in the documentation using the `ember g` command to
generate files. There is no analogous command using the Stripes CLI. You can
safely ignore these commands and simply create the file yourself. For example:

```bash
$ ember g mirage-model author
```

Instead of running this command, you'll create a new file at
`test/bigtest/network/models/author.js`.

### Defining Data

The Mirage [quickstart
guide](https://www.ember-cli-mirage.com/docs/v0.4.x/quickstart/) is the best
place to quickly learn how to define routes, models, and factories. In Stripes,
the server's `urlPrefix` property is preset to correspond to the Okapi URL found
in the platform's configuration file. There are also some default routes defined
by `stripes-core` [located
here](https://github.com/folio-org/stripes-core/blob/master/test/bigtest/network/config.js). You
may override these routes in your own config file, such as redefining the login
route to provide the correct permissions so you no longer need the
`--hasAllPerms` flag for `stripes serve --mirage`.

The Mirage configuration in both
[`ui-eholdings`](https://github.com/folio-org/ui-eholdings/blob/master/test/bigtest/network)
and
[`ui-inventory`](https://github.com/folio-org/ui-inventory/blob/master/test/bigtest/network)
have good examples of how routes, models, factories, and serializers all look in
a Stripes module. Starting `ui-eholdings` with Mirage enabled should allow you
to navigate around and be able to perform actions in the app without the need of
a backend server. If you open the developer console, you'll see that Mirage is
logging responses for the various mocked endpoints.

### Scenarios

If you're following the Mirage quickstart guide, you'll have likely added some
data using the default scenario in `bigtest/network/scenarios/default.js`. This
default scenario is used when the application is started with Mirage enabled. It
is not used during testing unless you explicitly tell Mirage to use a specific
scenario.

Scenarios are especially helpful when developing or testing features that
require the server to respond with errors or very specific pieces of data. You
might even define separate scenarios for admins and users to be able to start
the app quickly with the proper permissions.

The `--mirage` flag for `stripes serve` can accept a string indicating which
scenario you'd like to start. For example, running `stripes serve --mirage
missing-module` would load the scenario located at
`network/scenarios/missing-module.js` where we might define a scenario in which
a required backend module is missing; allowing you to easily develop features or
messaging around such a situation.

In testing, the `setupStripesCore` helper (explained more in the following
section) accepts a `scenarios` option to automatically load specific scenarios
for a suite of tests. You may also import the scenarios directly and pass them
the `this.server` instance found on Mocha's context.

## Writing Tests

BigTest tests in Stripes are written using [Mocha](https://mochajs.org/),
[Chai](https://www.chaijs.com), and of course
[BigTest](https://www.bigtestjs.io/). The application setup helper will also set
up the Mirage server so we can define mock data for our tests.

### Arrange-Act-Assert

BigTest tests in Stripes are written in the Arrange-Act-Assert pattern:

- **Arrange** all necessary preconditions.
- **Act** on the application under test.
- **Assert** that the expected results have occurred.

Here's an example of a test suite from `ui-inventory` written in this style:

```js
import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

// we'll go over these and the previous imports more in a moment
import setupApplication from '../helpers/setup-application';
import InventoryInteractor from '../interactors/inventory';

describe('Instances', () => {
  const inventory = new InventoryInteractor();

  // Arrange - setup application
  setupApplication();

  beforeEach(async function () {
    // Arrange - setup data
    this.server.createList('instance', 25);
    // Act - visit inventory
    this.visit('/inventory');
  });

  // Assert - expect the inventory app to be visible
  it('shows the list of inventory items', () => {
    expect(inventory.isVisible).to.equal(true);
  });

  // Assert - expect each instance we set up to be rendered
  it('renders each instance', () => {
    expect(inventory.instances().length).to.be.gte(5);
  });

  // Arrange - previous arrangement will be in effect
  describe('clicking on the first item', () => {
    beforeEach(async () => {       // Act - click an inventory instance
      await inventory.instances(0).click();
    });

    // Assert - expect the instance data to be visible
    it('loads the instance details', () => {
      expect(inventory.instance.isVisible).to.equal(true);
    });
  });
});
```

With BigTest, we separate the arrangement and actions into hooks and leave the
assertions pure. This results in very fast tests and allows BigTest to worry
about the async behavior of actions resulting in expectations, rather than
having to manually wait for events to happen. We'll go over and describe the
different pieces of each step in a bit more detail in the following sections.

### Application Setup

The application setup is part of our **arrange** step. The `setupApplicaton`
helper created by Stripes CLI hooks into `beforeEach` to mount the application
within the Stripe Core UI and setup the Mirage server for testing. The server
can then be accessed from `this.server` in other hooks to arrange for specific
data to be defined in tests. The helper also gives us access to a
`this.visit(location)` helper and updates `this.location` based on the current
location of the application.

Before we can successfully use the `setupApplication` helper, we need to
configure permissions for the fake user that is logged in while testing our
application. Let's look at the helper Stripes CLI generated for us:

```js
// test/bigtest/helpers/setup-application.js
import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import mirageOptions from '../network';

export default function setupApplication({
  scenarios
} = {}) {
  setupStripesCore({
    mirageOptions,
    scenarios
  });
}
```

You'll notice that this is just a thin wrapper which passes on local mirage
options to `setupStripesCore`. This helper also accepts a `disableAuth` option
which defaults to `true` for testing. This option will bypass the login screen
and allow our application to be accessible in our tests without having to login
every single time.

In order for our tests to work properly without authentication, we'll need to
provide permissions for our fake user using the `permissions` option:

```js
setupStripesCore({
  permissions: [...],
  // ...
});
```

If you need to modify permissions for different tests, you can have the
application helper accept additional permissions to add to a set of defaults
passed along to the `stripes-core` helper. This might look something like the
following:

```js
export default function setupApplication({
  permissions = [],
  scenarios
} = {}) {
  setupStripesCore({
    permissions: [
      ...defaultPermissions,
      ...permissions
    ],
    mirageOptions,
    scenarios
  });
}
```

If your application does not deal with multiple permission sets, it may be
easier and quicker to provide the `stripesConfig` option `hasAllPerms: true`:

```js
export default function setupApplication({
  hasAllPerms = true,
  permissions,
  scenarios
} = {}) {
  setupStripesCore({
    stripesConfig: { hasAllPerms },
    permissions,
    mirageOptions,
    scenarios
  });
}
```

Once your user's permissions have been defined here, we can start using this
helper to **arrange** our application setup before interacting with it and
making assertions.

### Interactors

In our `ui-inventory` tests from earlier, you may have noticed the use of
something called an `Interactor`. We use interactors to describe and **act** on
our application under test.

```js
import InventoryInteractor from '../interactors/inventory';
// ...
const inventory = new InventoryInteractor();
// ...
expect(inventory.instances().length).to.be.gte(5);
// ...
await inventory.instances(0).click();
// ...
expect(inventory.instance.isVisible).to.equal(true);
```

You can think of interactors as composable [page
objects](https://martinfowler.com/bliki/PageObject.html) for modern
components. The BigTest website has a great [introduction to
interactors](https://www.bigtestjs.io/guides/interactors/introduction/) that
goes into more detail about them. Interactors used in acceptance tests are
located in `bigtest/interactors`.

Let's look at that `InventoryInteractor` we were just using:

```js
// test/bigtest/interactors/inventory.js
import {
  interactor,
  scoped,
  collection
} from '@bigtest/interactor';

export default @interactor class InventoryInteractor {
  static defaultScope = '[data-test-inventory-instances]';

  instances = collection('[role=listitem] a');
  instance = scoped('[data-test-instance-details]');
}
```

This is all we need to be able to assert that the correct number of instance are
loaded, click one of them, and assert that we're able to see the instance
details view. You can read more about [custom interactors from the official
guides](https://www.bigtestjs.io/guides/interactors/custom-interactors/), and
see a list of [default interactions and interaction
creators](https://www.bigtestjs.io/guides/interactors/available-interactions/).

[Interactors are also
composable](https://www.bigtestjs.io/guides/interactors/composing-interactors/),
just like the components we work with. The components in `stripes-components`
are all tested using interactors, and as such you can import them into your own
interactors for your Stripes application's tests.

```js
import { interactor, scoped } from '@bigtest/interactor';

// require's `@folio/stripes-components` to be a dev dependency
import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

export default @interactor class MyFormInteractor {
  static defaultScope = '[data-test-myform]';

  name = scoped('[data-test-myform-name-field]', TextFieldInteractor);
  email = scoped('[data-test-myform-email-field]', TextFieldInteractor);
  submit = scoped('[data-test-myform-submit]', ButtonInteractor);
}

// ...

await new MyFormInteractor()
  .name.fillInput('Name Namerson')
  .email.fillInput('email@domain.tld')
  .submit.click()
```

_Note: the import path of interactors from `stripes-components` will soon be
made more accessible for official use in other modules._

### Convergent Assertions

BigTest's [`@bigtest/mocha`](https://github.com/bigtestjs/mocha) package thinly
wraps Mocha's `it` in a convergent assertion. Convergent assertions allow us to
**assert** on our application state that may not have finished processing or
being fully rendered yet.

From the `ui-inventory` example from earlier:

```js
import { describe, beforeEach, it } from '@bigtest/mocha';

// ...

describe('clicking on the first item', () => {
  beforeEach(async () => {
    await inventory.instances(0).click();
  });

  it('loads the instance details', () => {
    expect(inventory.instance.isVisible).to.equal(true);
  });
});
```

When we click on the first inventory instance in the list, the interactor does
not know what results to expect from the application, so it resolves right after
clicking. In the following test, we assert that the instance view is visible
after clicking. This does not happen immediately due to event handlers,
lifecycle hooks, the render loop, network requests, etc., but the test still
passes once all of those things have happened.

This is because the assertion _converges_ on a passing state: it is run again
and again every `10ms` until it does pass or until it exceeds a timeout
defaulting to `2000ms`. Interactors are also convergences and will not interact
with an element until it exists in the DOM.

Since the `it` method from `@bigtest/mocha` is convergent, we keep the
**assert** pure and the side-effects for **arrange** are kept in our
hooks. Otherwise, the side-effects may be performed dozens or even hundreds of
times while the assertion converges.

If a convergence fails, it will throw an error _after_ the timeout period has
expired. Mocha's `it` timeouts can be configured per test, or per suite using
the `.timeout()` method:

```js
describe('clicking on the first item', function () {
  // sets the timeout for all tests within this suite
  this.timeout(3000);

  beforeEach(async function () {
    this.timeout(500); // hook timeout
    await inventory.instances(0).click();
  });

  it('loads the instance details', () => {
    expect(inventory.instance.isVisible).to.equal(true);
  }).timeout(1000); // individual test timeout
});
```

Interactor timeouts can also be configured, but interactor timeouts persist _per
interactor instance_.

```js
// each interaction inherits this timeout
const myForm = new FormInteractor().timeout(3000);

// each await below could potentially take almost 3000ms before passing
await myForm.name.fillInput('Name Namerson');
await myForm.email.fillInput('email@domain.tld');
// this would timeout after 1000ms instead
await myForm.submit.click().timeout(1000);

// chaining interactor actions makes them share the same timeout
await myForm.timeout(1000)
   // all interactions together will take place within 1000ms
  .name.fillInput('Name Namerson')
  .email.fillInput('email@domain.tld')
  .submit.click();
```

#### Asserting when a state is NOT expected

A common test to write is a test ensuring an action _does not_ cause unintended
side-effects. The test could potentially pass successfully before a side-effect
has time to even happen. In these scenarios, you want to converge when the state
meets an expectation for a given period of time. In other words, "if this
assertion remains true for X amount of time, this test is considered to be
passing."

`@bigtest/mocha` provides an `it.always` method to do just this. This method
will run the assertion throughout the entire timeout period ensuring it never
fails. When the assertion does fail, the test fails. If the assertion never
fails, it will pass just after the timeout period.

```js
// the default timeout for it.always is 200ms
it.always('does not navigate away for at least 1 second', function () {
  expect(this.location.pathname).to.equal('/myapp');
}).timeout(1000);
```

#### Asserting when a state persists

There is currently no built-in way to combine to two different convergent
assertions, `it` and `it.always`. So if there is a case in which you want to
assert that once something does happen it persists, you must split the test and
utilize the interactor's `.when()` method to wait for the desired state.

```js
describe('a page modal', () => {
  // some interactor for a page with a modal
  const page = new PageInteractor();

  beforeEach(async () => {
    await page.toggleModal()
  });

  it('shows a modal', () => {
    expect(page.modal.isVisible).to.be.true;
  });

  describe('after opening', () => {
    beforeEach(async () => {
      // wait for the modal to be visible (open)
      await page.when(() => page.modal.isVisible);
    });

    it.always('stays open', () => {
      expect(page.modal.isVisible).to.be.true;
    });
  });
});
```

## Running Tests

To run BigTest tests in a Stripes application, you can use the `stripes test
karma` command. This command uses [Karma](http://karma-runner.github.io) to
bundle tests, launch a browser to run them, and report the results of those
tests back to the CLI.

### Karma

Stripes automatically configures Karma to work with BigTest and Stripes
applications. You can pass Karma specific CLI flags to Stripes using a `karma`
prefix. For example, to tell Karma to launch Firefox, use `stripes test karma
--karma.browsers Firefox`.

To adjust the Karma configuration before running tests, provide a
`karma.conf.js` file in the root of your project and export a function which
takes a Karma configuration object. [More info is available in the official
documentation on the Karma
website.](http://karma-runner.github.io/3.0/config/configuration-file.html)

### Browser Support

Stripes preconfigures Karma with both the `karma-chrome-launcher` and
`karma-firefox-launcher` plugins. To launch other browsers, you can push the
launcher plugin to the `config.plugins` array via a`karma.conf.js` file in your
project's root. A list of available browser launcher plugins can be found on
[Karma's documentation page for
browsers](http://karma-runner.github.io/3.0/config/browsers.html).

### Coverage

Karma, in Stripes, has the [Istanbul coverage
reporter](https://github.com/mattlewis92/karma-coverage-istanbul-reporter#readme)
available via the `--coverage` flag. Running your tests with `stripes test karma
--coverage` will provide a coverage report for BigTest tests. You can also
configure the coverage threshold levels via the `karma.conf.js` file.

```js
// karma.conf.js
module.exports = (config) => {
  // Turn on coverage report thresholds
  if (config.coverageIstanbulReporter) {
    config.coverageIstanbulReporter.thresholds.global = {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    };
  }
};
```

### Continuous Integration

By default, Karma watches for changes to files so it can rerun tests. This is
not ideal for CI since we want to generate reports for a single run and exit. To
accomplish this, we can use the `--karma.singleRun` flag.

Stripes also configures Karma to use the Mocha reporter by default. To use other
reporters such as JUnit, we can provide a list of reporters to the
`--karma.reporters` flag.

Finally, if running in Jenkins in Stripes, you'll need the `ChromeDocker`
browser. Jenkins will call the `yarn test` command and pass any flags provided
to the `runTestOptions` option in the `JenkinsFile` in the project root. To run
BigTest tests in Jenkins with JUnit and coverage reporting, the value of
`runTestOptions` would be:

```js
'--karma.singleRun --karma.reporters mocha junit  --karma.browsers ChromeDocker --coverage'
```
