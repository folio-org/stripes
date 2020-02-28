# Upgrading to `stripes` `v3.0.0`

Updating an app from `@folio/stripes` `^2.0.0` to `^3.0.0` should be relatively
straightforward as most of the changes revolve around reorganizing dependencies.
A few things were removed in `stripes-components` and `stripes-connect`, but those
components were deprecated months (or years!) ago.

## Move some dependencies to peerDependencies

The following libraries should be moved from dependencies to peerDependencies:

* `react-intl`
* `react-router`
* `react-router-dom`

You can do this manually or with help from yarn with commands like this:

```
yarn add -P react-intl@^2.2.9.0
yarn add -P react-router@^4.3.1
yarn add -P react-router-dom@^4.3.1
```

## Add some devDependencies

`yarn` will not include peerDependencies when creating a development build, which
effectively means that every peerDependency must also be added as a devDependency
in order for tests to run. You can do this manually or with help from yarn:

```
yarn add -P react-router-dom@^4.3.1
```

## Update devDependencies for stripes-* libraries

Many unit tests import interactors directly from stripes libraries using named
paths, meaning these libraries need to be listed as devDependencies. `@folio/stripes`
`v3.0.0` corresponds to the following versions of stripes libraries:

* stripes-components 6.0.0
* stripes-connect 5.5.0
* stripes-core 4.0.0
* stripes-form 3.0.0
* stripes-final-form 2.0.0
* stripes-logger 1.0.0
* stripes-smart-components 3.0.0
* stripes-util 2.0.0
