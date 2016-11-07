# Building and running Stripes from git checkouts

<!-- ../../okapi/doc/md2toc -l 2 building-from-git-checkouts.md -->
* [Introduction](#introduction)
* [Avoiding uploaded NPM packages](#avoiding-uploaded-npm-packages)
* [Running a minimal Stripes configuration](#running-a-minimal-stripes-configuration)
* [Adding more modules](#adding-more-modules)
* [Appendix: Troubleshooting transpilation](#appendix-troubleshooting-transpilation)

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
and
`stripes-experiments`
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

First, configure the loader. You can do this by adding the required
module to the `stripesLoader.modules` object in
`webpack.config.cli.js`. Or if you prefer to avoid making uncommitted
local changes to version-controlled files, you can create a separate
`stripes-modules.js` (see `stripes-modules.js.example` for an example)
and add the module there. For example, that file might contain:

	module.exports = {
	  '@folio-sample-modules/trivial-okapi': {}
	};

Second, make the module available to `stripes-core`:

	$ cd node_modules/@folio-sample-modules
	// One or more of the following
	$ ln -s ../../examples/trivial-okapi
	$ ln -s ../../../stripes-experiments/okapi-console
	$ ln -s ../../../stripes-experiments/patrons
	$ cd ../..

Third, make the module available to `stripes-loader`:

	$ cd ../stripes-loader/node_modules/@folio-sample-modules
	// One or more of the following
	$ ln -s ../../../stripes-core/examples/trivial-okapi
	$ ln -s ../../../stripes-experiments/okapi-console
	$ ln -s ../../../stripes-experiments/patrons
	$ cd ../../../stripes-core

Now you should be able to restart the Stripes service and see the
newly enabled modules running:

	$ npm run start

<br/>
<hr/>

## Appendix: Troubleshooting transpilation

> **NOTE.**
> This section _shouldn't_ be needed any more, and ought to be removed
> in a future version of the document if the issues it described don't
> cause further problems. See
> [STRIPES-32](https://issues.folio.org/browse/STRIPES-32).

This may fail with:

	ERROR in ../trivial/About.js
	Module parse failed: /home/mike/git/work/stripes-experiments/trivial/About.js Unexpected token (4:18)
	You may need an appropriate loader to handle this file type.

This is because Babel is not translating the trivial module from JS6. The
rules that tell WebPack which files to transpile are found in
`webpack.config.base.js`, These rules do say to transpile files
within the `@folio` area. Unfortunately, WebPack resolves symbolic
links before making this check, so the modules that we linked into
`@folio` are instead seen as being in their physical location, and
transpilation is skipped.

The fix is to edit `webpack.config.base.js`, commenting out the
`include:` line and uncommenting the `exclude:` line that follows it,
thus:

	//include:  [path.join(__dirname, 'src'), /@folio/, path.join(__dirname, '../dev')]
	exclude: [/node_modules/]

**WARNING: do not commit this change**. If it gets pushed into the
master repo, it will prevent modules from the NPM registry from
working correctly.

Once this change has been made, `npm run start` will finally work, and
you can view the running UI on `http://localhost:3000/`.

