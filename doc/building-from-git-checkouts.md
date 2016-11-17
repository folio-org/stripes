# Building and running Stripes from git checkouts

<!-- ../../okapi/doc/md2toc -l 2 building-from-git-checkouts.md -->
* [Introduction](#introduction)
* [Avoiding uploaded NPM packages](#avoiding-uploaded-npm-packages)
* [Running a minimal Stripes configuration](#running-a-minimal-stripes-configuration)
* [Adding more modules](#adding-more-modules)

## Introduction

If you are working not just on Stripes _modules_ but on Stripes
itself, you will want to use your own git checkouts of the various
Stripes packages (`stripes-connect`, etc.) To do this, you basically
have to trick NPM into pulling in these packages from your checkout
instead of from the package repository. You do this by subverting the
`@folio` scope as described below.

We assume here that you have the
`stripes-core`,
`stripes-connect`,
`stripes-components`
`stripes-loader`,
`stripes-experiments`,
and
`ui-okapi-console`
git modules all checked out next to each other. (At present, the
Experiments module still contains the Okapi Console and the Patrons
module.)

## Avoiding uploaded NPM packages

If you want to be sure that you are using only your local checkouts
and not packages that have been uploaded to NPM, begin by removing any
NPM configuration you may already have which tells where to download
the production versions of these packages from:

	$ npm config delete @folio:registry
	$ npm config delete @folio-sample-modules:registry

## Running a minimal Stripes configuration

This procedure will run a version of Stripes containing only the
Trivial module which presents a modifiable greeting.

First, pre-populate the Stripes core code's `node_modules` area with
symbolic links to the code you want to work on. Starting in the
`stripes-core` checkout:

	$ mkdir -p node_modules/@folio
	$ cd node_modules/@folio
	$ ln -s ../../../stripes-connect
	$ cd stripes-connect
	$ npm install
	$ cd ..
	$ ln -s ../../../stripes-components
	$ cd stripes-components
	$ npm install
	$ cd ..
	$ ln -s ../../../stripes-loader
	$ cd stripes-loader
	$ npm install
	$ npm run build

Next, we wire the trivial module into place. Two places, actually:
`stripes-loader` and `stripes-core` both need to be able to see
it. First we'll do `stripes-core` since we're already here:

	$ cd ../..
	$ mkdir @folio-sample-modules
	$ cd @folio-sample-modules
	$ ln -s ../../examples/trivial

Now `stripes-loader`. To avoid confusion about what links where, we'll
use the natural home of the loader checkout rather than the link we
made to it.

	$ cd ../../../stripes-loader/node_modules
	$ mkdir @folio-sample-modules
	$ cd @folio-sample-modules
	$ ln -s ../../../stripes-core/examples/trivial

You don't need to build the trivial modules, as it gets pulled into the
Stripes UI by WebPack when it is built. So now you are ready to build
and run the stripes core service that provides the UI:

	$ cd ../../../stripes-core
	$ npm install
	$ npm run start

## Adding more modules

At present, adding an extra module to your Stripes configuration is a
three-stage process. You must instruct the Stripes Loader to include
the module, and make it available to both Stripes Core and Stripes
Loader.

First, configure the loader. You can do this by listing the required
modules in `stripes.config.js`, along with other configuration
information such as the Okapi URL. See `stripes.config.js.example` for
an example.

Second, make the module available to `stripes-core`:

	$ cd node_modules/@folio-sample-modules
	// One or more of the following
	$ ln -s ../../examples/trivial-okapi
	$ ln -s ../../../ui-okapi-console
	$ ln -s ../../../stripes-experiments/patrons
	$ cd ../..

Third, make the module available to `stripes-loader`:

	$ cd ../stripes-loader/node_modules/@folio-sample-modules
	// One or more of the following
	$ ln -s ../../../stripes-core/examples/trivial-okapi
	$ ln -s ../../../ui-okapi-console
	$ ln -s ../../../stripes-experiments/patrons
	$ cd ../../../stripes-core

Now you should be able to restart the Stripes service and see the
newly enabled modules running:

	$ npm run start

