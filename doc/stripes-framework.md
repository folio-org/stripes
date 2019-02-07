# Stripes Framework

* [Introduction](#introduction)
* [Modules](#modules)
* [Usage](#usage)
* [Release procedure](#release-procedure)
* [Upgrade notes](#upgrade-notes)
    * [Migrating to v1.0](#migrating-to-v10)
    * [Upgrading to v1.1](#upgrading-to-v11)
    * [Upgrading to v2.0](#upgrading-to-v20)


## Introduction

Stripes framework is a collection of supporting modules for building a FOLIO user interface.  Stripes wraps underlying `stripes-*` modules, defining dependencies on versions known to work well together.  This takes the burden off app developers for selecting potentially incompatible versions of the underlying modules.


## Modules

The modules included within Stripes are:
* [stripes-components](https://github.com/folio-org/stripes-components) -- A component library for Stripes
* [stripes-connect](https://github.com/folio-org/stripes-connect) -- Manages the connection of UI components to back-end modules
* [stripes-core](https://github.com/folio-org/stripes-core) -- The core of Stripes, an opinionated and modular platform for React components consuming REST data and the UI framework for the FOLIO project
* [stripes-form](https://github.com/folio-org/stripes-form) -- A redux-form wrapper for Stripes
* [stripes-logger](https://github.com/folio-org/stripes-logger) -- Simple category-based logging for Stripes
* [stripes-smart-components](https://github.com/folio-org/stripes-smart-components) -- A suite of smart components. Each communicates with an Okapi web-service in order to provide the facilities that it renders
* [stripes-util](https://github.com/folio-org/stripes-util) -- A library of utility functions to support Stripes modules


## Usage

Include `stripes`, as well as `react`, both as peerDependencies and devDependencies in your app's package.json. The peerDependency ensures the same version of `stripes` is shared across all apps when your app is included in a FOLIO [platform](https://github.com/folio-org/stripes-sample-platform).  The devDependency enables your app to be built and run stand-alone with a version of `stripes` for development and testing.
```
  "devDependencies": {
    "@folio/stripes": "^1.0.0",
    "@folio/stripes-cli": "^1.5.0",
    "react": "^16.4.1",
  },
  "peerDependencies": {
    "@folio/stripes": "^1.0.0"
    "react": "*"
  }
```

Import your `stripes-*` dependencies, such as `stripes-components`, through the exports provided by `stripes`:
```
import {
  Select,
  TextField,
  Row,
  Col,
  Accordion,
  Headline
} from '@folio/stripes/components';
import { AddressEditList } from '@folio/stripes/smart-components';
```

Note: Beginning with version 1.6, [stripes-cli](https://github.com/folio-org/stripes-cli) generates new apps using `stripes` framework.


## Release procedure

When releasing a new version of `stripes` framework, follow the general [release procedure](./release-procedure.md) for each of the individual `stripes-*` modules contained within `stripes` and for `stripes` itself.  The following describes additional steps that should be taken into consideration when upgrading the framework and rolling it out to ui-modules and platforms.

> Note: Until STRIPES-588 is addressed, if any one `stripes-*` module requires a major or minor version bump, then all `stripes-*` modules should receive a major or minor version bump.  This avoids leaking dependencies from the new release into the old release which can lead to duplicate instances of `stripes-components`.

* Update and release individual `stripes-*` modules.
  * Remember to update version numbers of any inter-stripes dependencies.
* Update and release `stripes` framework.
  * Include links to `stripes-*` module changelogs in the `stripes` [changelog](https://github.com/folio-org/stripes/blob/master/CHANGELOG.md).
* Document `ui-*`/`platform-*` update procedure in the [upgrade notes](#upgrade-notes).
* Update `platform-*` snapshot branches locally (peerDependency install warnings expected) and review any errors.
  * For an early check, do this before releasing `stripes` by pointing your local platform to the release branch of `stripes`.
  * Commit changes and release snapshot version when things look good.
  * Note: `platform-complete` snapshot depends on the snapshot release of `platform-core`.
* Update and release `ui-*` module versions (if applicable, will be necessary for breaking changes).
* Update and release other relevant `platform-*` branches (quarterly/master/next-release).
* Update Stripes-CLI's ui-module blueprint to reference the new stripes-framework version, update the stripes-core version (if applicable), and release stripes-cli.


## Upgrade notes

The following captures the general upgrade notes from one version of `stripes` framework to another.  Take into account notes between your current version and the version to upgrade to.  For instance, if upgrading from `1.0` to `2.0`, review the steps for `1.1` and `2.0`.


### Migrating to v1.0

To migrate existing apps developed prior to the introduction of stripes framework, begin by adding `stripes` to your package.json as noted [above](#usage).

Next, review all `@folio/stripes-*` imports replacing hyphens as necessary:
```
- import { Button } from '@folio/stripes-components';
+ import { Button } from '@folio/stripes/components';
```

Take care to remove any path-based imports you may have in the process:
```
- import Button from '@folio/stripes-components/lib/Button';
+ import { Button } from '@folio/stripes/components';
```

Review the [stripes-components 4.x changelog](https://github.com/folio-org/stripes-components/blob/master/CHANGELOG.md#400-2018-10-02) for any breaking changes and moved components.  Update affected imports to reflect their new component locations.

Finally remove all individual `stripes-*` dependencies from your app's package.json.  Re-run your app to verify everything is working properly.


### Upgrading to v1.1

Upgrading to `stripes` version `1.1.0`, requires some minor adjustments to package.json.  The process varies slightly for ui-modules and platforms.

To upgrade a ui-module, define any peerDependencies you may have on `react`, `react-dom`, `react-redux`, and `redux` also as _devDependencies_. This will ensure that these packages are properly fulfilled for isolated development and testing of your ui-module. Then upgrade your version of `@folio/stripes` to `1.1.0` in both devDependencies and peerDependencies.

```
"name": "@folio/ui-example",
"devDependencies": {
  "@folio/stripes": "^1.1.0",
  "@folio/stripes-cli": "^1.6.0",
  "react": "~16.6.3",
  "react-dom": "~16.6.3",
  "react-redux": "~5.1.1",
  "redux": "~3.7.2"
},
"peerDependencies": {
  "@folio/stripes": "^1.1.0",
  "react": "*",
  "react-dom": "*",
  "react-redux": "*",
  "redux": "*"
},
```

To upgrade a platform, add dependencies for `react`, `react-dom`, `react-redux`, and `redux`. This will ensure that these packages, defined as peerDependencies within ui-modules, are properly fulfilled at the platform level. Then upgrade your version of `@folio/stripes` to `1.1.0`.

```
"name": "@folio/platform-example",
"dependencies": {
  "@folio/stripes": "^1.1.0",
  "@folio/stripes-cli": "^1.6.0",
  "react": "~16.6.3",
  "react-dom": "~16.6.3",
  "react-redux": "~5.1.1",
  "redux": "~3.7.2"
},
```

Finally, for both ui-modules and platforms, regenerate your `yarn.lock` file, if applicable.


### Upgrading to v2.0

Review STRIPES-577 and the following changelogs for any breaking changes with your use of `stripes-*` dependencies.  Breaking changes have been throwing deprecation warnings for some time, so these should not be new.  Update usage of affected components if you haven't done so already.
* [stripes-core v3.0.x](https://github.com/folio-org/stripes-core/blob/master/CHANGELOG.md#300-2019-01-15)
* [stripes-components v5.0.x](https://github.com/folio-org/stripes-components/blob/master/CHANGELOG.md#500-2019-01-15)
* [stripes-smart-components v2.0.x](https://github.com/folio-org/stripes-smart-components/blob/master/CHANGELOG.md#200-2019-01-16)

For `ui-*` modules, upgrade your version of `@folio/stripes` from `^1.1.0` to `^2.0.0` in both _devDependencies_ and _peerDependencies_.

For platforms, upgrade your version of `@folio/stripes` from `^1.1.0` to `^2.0.0` in _dependencies_.

For both `ui-*` modules and platforms, upgrade your devDependency of `stripes-cli` to `^1.8.0`.
