# Stripes: quick start

## Pre-requisites

To run Stripes, you'll need to have [Node.js](https://nodejs.org/) 6.x installed (check with `node --version`).

You'll also need a package manager. We strongly recommend using [yarn](https://yarnpkg.com/). Once Yarn is installed, inform it that packages in the `@folio` scope are found on the FOLIO NPM repository:
```
yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
```

## Platform

Next you'll need a Stripes "platform". It consists simply of an NPM [`package.json`](https://docs.npmjs.com/files/package.json) that specifies the version of `@folio/stripes-core` and of any Stripes modules you wish to make available to generate client bundles. As a starting point, check out a [sample platform](https://github.com/folio-org/stripes-sample-platform).

From that platform directory, install everything with:
```
yarn install
```

At this point, you can choose some modules to enable in `stripes.config.js` and run the development server with:
```
yarn start
```

Voilà! A development server should be running at http://localhost:3000

The default configuration has two UI modules configured in `stripes.config.js`:
"trivial" (whose code is in [stripes-core/examples/trivial](../examples/trivial))
and "users" (whose code is in the separate [ui-users](https://github.com/folio-org/ui-users) repository).

The "Trivial" example will work, as it is independent of Okapi.
However the "Users" example requires Okapi and the back-end services of various modules and sample data.
The simplest way to achieve that is using one of the provided
[virtual machines](https://github.com/folio-org/folio-ansible/blob/master/README.md).
Other ways are also [explained](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md).


## Using Stripes CLI

Stripes CLI facilitates Stripes UI development and testing.  It can be used in addition to, or in place of, other manual development steps. Install the CLI with:
```
yarn global add @folio/stripes-cli
```

### Sample commands:

Create a new Stripes UI app module without a platform:
```
stripes app create "Hello World"
```

Create a new Stripes platform:
```
stripes platform create
```

Refer to the [Stripes-CLI user guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md) for a complete overview on creating an app or platform with the CLI as well as other useful commands.


## Using local code

**Stripes CLI users:** Please refer to [Including another Stripes module](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#including-another-stripes-module) of the Stripes CLI user guide.

Module developers and those wanting to use a local checkout of core Stripes components can use the convenient [`yarn link`](https://yarnpkg.com/en/docs/cli/link) command to set their platform to use the local copy. Simply run `yarn link` in your `somemodule` directory and then run `yarn link somemodule` in the platform's directory and repeat for each local dependency you wish to create symlinks for.

For example, to link the Users module, change to the directory you checked out of git (ui-users) and run:
```
yarn link
yarn install
```

Note that linked dependencies will use their local copy of the `node_modules` directory and the platform will not trigger `yarn install` for you there.

Then change to your platform directory and run:
```
yarn link @folio/users
yarn start
```

**Note 1.** As of 20 February 2017, yarn cannot find `yarn link`ed modules unless they _also_ have been published in the repository. This is [a recognised bug, issue 2611](https://github.com/yarnpkg/yarn/issues/2611) and should soon be fixed.

