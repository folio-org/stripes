# Stripes: quick start

<!-- md2toc -l 2 quick-start.md -->
* [Prerequisites](#prerequisites)
* [App development](#app-development)
* [Platform development](#platform-development)
* [Using local code](#using-local-code)
* [More information](#more-information)

## Prerequisites

* [Node.js](https://nodejs.org/) with an [active LTS version](https://github.com/nodejs/Release#release-schedule)
* [Yarn v1](https://classic.yarnpkg.com/lang/en/) package manager
* [Vagrant](https://www.vagrantup.com/downloads.html) for optionally hosting a local [pre-built back-end](https://github.com/folio-org/folio-ansible/blob/master/doc/index.md) environment

Inform Yarn that packages in the `@folio` scope are found on the FOLIO NPM repository:
```
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

Install the Stripes CLI:
```
$ yarn global add @folio/stripes-cli
```

## App development

Development of a single application can be performed entirely stand-alone.  Simply clone the repository, install dependencies, and run `yarn start`.

```
$ git clone https://github.com/folio-org/ui-users.git
$ cd ui-users
$ yarn install
$ yarn start
```

This is possible because each app declares a devDependency on stripes-cli, and the package script `yarn start` refers to the CLI command `stripes serve`.

Refer to the [Stripes-CLI user guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#app-development) for an overview on creating a new app with the CLI.


## Platform development

The easiest way to work on multiple applications simultaneously is with a Yarn workspace.  Create a new workspace with the stripes-cli `workspace` command.  This command is interactive and will prompt for the `ui-*` modules you would like to include.  Be sure to select a platform such as `stripes-sample-platform` as well.  Selected modules will be git-cloned and installed automatically.

```
$ stripes workspace
? Stripes modules to include (Press <space> to select, <a> to toggle all, <i> to invert selection)
 --- UI Modules ---
❯◯ ui-users
 ◯ ui-inventory
 ◯ ui-eholdings
 ◯ ui-checkin
 ◯ ui-checkout
 ◯ ui-circulation
(Move up and down to reveal more choices)
```

At this point, the modules you selected with the workspace command will be added to your `stripes.config.js.local` configuration for any platform(s) selected.  Change to the platform directory and run the development server with:

```
$ cd stripes/stripes-sample-platform
$ stripes serve stripes.config.js.local
```

Voilà! A development server should be running at http://localhost:3000

The default configuration has UI modules configured in `stripes.config.js.local`.  If you selected `stripes-sample-platform` this will include "Trivial" and "Users" by default, plus any other modules selected during the workspace command.

The "Trivial" example will work, as it is independent of Okapi.
However the "Users" example requires Okapi and the back-end services of various modules and sample data.
The simplest way to achieve that is using one of the provided
[virtual machines](https://github.com/folio-org/folio-ansible/blob/master/README.md) (e.g. folio/testing-backend).
Other ways are also [explained](https://dev.folio.org/guides/run-local-folio/).



## Using local code

When using a Yarn workspace, module developers and those wanting to use a local checkout of core Stripes components can simply select `stripes-components` (or other `stripes-*` modules) during module selection of the `workspace` command.

```
$ stripes workspace
? Stripes modules to include
 --- Stripes Modules ---
 ◉ stripes-connect
 ◉ stripes-components
❯◉ stripes-smart-components
 ◯ stripes-react-hotkeys
 ◯ stripes-logger
 ◯ stripes-form
(Move up and down to reveal more choices)
```

Not using a workspace?  Please refer to [Including another Stripes module](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#including-another-stripes-module) of the Stripes CLI user guide for details on how to include additional modules without a Yarn workspace.


## More information

Additional information can be found in the Stripes CLI [User Guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md) and the
Stripes [New Development Setup Guide](https://github.com/folio-org/stripes-core/blob/master/doc/new-development-setup.md).
