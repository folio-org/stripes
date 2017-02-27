# Stripes: quick start

## Pre-requisites

To run Stripes, you'll need to have [Node.js](https://nodejs.org/) 6.x installed (check with `node --version`).

You'll also need a package manager. We strongly recommend using [yarn](https://yarnpkg.com/). Once Yarn is installed, inform it that packages in the `@folio` scope are found on the FOLIO NPM repository:
```
yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
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

The default "Trivial" example will work, as it is independent of Okapi.
However the "Users" example requires Okapi and the back-end services of various modules and sample data.
The simplest way to achieve that is using one of the provided
[virtual machines](https://github.com/folio-org/folio-ansible/blob/master/README.md) (e.g. folio-backend).
Other ways are also [explained](https://github.com/folio-org/ui-okapi-console/blob/master/doc/running-a-complete-system.md).

## Using local code

Module developers and those wanting to use a local checkout of core Stripes components can use the convenient [`yarn link`](https://yarnpkg.com/en/docs/cli/link) command to set their platform to use the local copy. Simply run `yarn link` in your `somemodule` directory and then run `yarn link somemodule` in the platform's directory and repeat for each local dependency you wish to create symlinks for.

For example, to link the Users module, change to the directory you checked out of git (ui-users) and run:
```
yarn link
yarn upgrade
```

And then change to your platform directory and run:
```
yarn link @folio/users
yarn start
```

**Note 1.** The `stripes-loader` module does not currently support being included via link.

**Note 2.** As of 20 February 2017, yarn cannot find `yarn link`ed modules unless they _also_ have been published in the repository. This is [a recognised bug, issue 2611](https://github.com/yarnpkg/yarn/issues/2611) and should soon be fixed.

