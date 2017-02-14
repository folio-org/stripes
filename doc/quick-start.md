# Stripes: quick start

## Pre-requisites

To run Stripes, you'll need to have [Node.js](https://nodejs.org/) 6.x installed (check with `node --version`).

You'll also need a package manager. We strongly recommend using [yarn](https://yarnpkg.com/). Once you have Yarn installed, you'll need to inform it that packages in the `@folio` scope are found on the Folio repository:
```
yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

## Platform

Next you'll need a Stripes "platform". It consists simply of an NPM [`package.json`](https://docs.npmjs.com/files/package.json) that specifies the version of `@folio/stripes-core` and of any Stripes modules you wish to make available to generate client bundles. As a starting point, you might want to check out a [sample platform]. From the platform directory you can then install everything with:
```
yarn install
```

At this point, you can choose some modules to enable in `stripes.config.js` and run the development server with:
```
yarn start
```

Voilà! A development server should be running at http://localhost:9130

## Using local code

Module developers and those wanting to use a local checkout of core Stripes components can use the convenient [`yarn link`](https://yarnpkg.com/docs/cli/link/) command to set their platform to use the local copy. Simply run `yarn link` in your `somemodule` directory and then run `yarn link somemodule` in the platform's directory and repeat for each local dependency you wish to create symlinks for.

N.B. The `stripes-loader` module does not currently support being included via link.
