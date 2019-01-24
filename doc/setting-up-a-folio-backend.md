# Setting up a minimal FOLIO back-end

It is now possible to run a FOLIO back-end in a VirtualBox VM that runs all and only the modules that you need for the specific development you are doing. For example, if you are developing ReShare, you can have your VM running only those back-end modules required for the UI modules you're interested in. This approach is more flexible than using a pre-configured box, and also more efficient in both disk-space and CPU overhead.

## 1. Set up your Stripes config

You will need a file like this, as you always do when running Stripes:

	module.exports = {
	  okapi: { 'url':'http://localhost:9130', 'tenant':'diku' },
	  modules: {
	    '@folio/users': {},
	    '@folio/rs': {},
	    '@folio/directory': {},
	  },
	};

(For our present purposes, the only part of this that matters is the list of modules, though in practice your file will likely also include a `config` section, branding, etc.)

## 2. Install the front-end modules

This is necessary so that the front-end modules' package-files are available for the Stripes CLi to inspect, in order to determine which back-end modules are dependencies. Do this in the usual way:

	yarn install

## 3. Create a Vagrant configuration

You need to tell Vagrant where to get the VM image for the core FOLIO back-end:

	vagrant init --minimal folio/snapshot-backend-core

(In fact, it turns out that this VM contains many more modules that you need to run a minimal FOLIO; it will be superseded in due course by a much more cut-down `snapshot-backend-minimal` VM, which should be used instead to get a leaner backend system. But for now it's fine to use `snapshot-backend-core`: it works fine, it's just lugging around some superfluous modules.)

## 4. Fetch and start the virtual machine

This is just the standard Vagrant command:

	vagrant up

## 5. Set up default arguments for the Stripes CLI

To avoid the need to laboriously specify the `--okapi` and `--tenant` arguments to each invocation of the Stripes CLI `stripes`, default values for these command-line arguments can be set. If you don't already have it, make a `.stripesclirc` file in your home directory with contents like the following:

	{
	  "okapi": "http://localhost:9130",
	  "tenant": "diku"
	}


## 6. Add descriptors for the front-end modules under development

You will need to do this separately for each of the modules: for example, if you are working on the `ui-rs` and `ui-directory` UI modules in ReShare, you must add both.

For each, change to the directory containing the source code, and run:

	stripes mod add --strict

## 7. Install the back-end modules

Here's where the magic happens: in a single step, the Stripes CLI can configure the VM's Okapi with all the back-end modules that are used, directly or indirectly, by the UI modules configured in your application:

	stripes platform backend stripes.config.js --user diku_admin

(The `--user diku_admin` causes it to additonally insert all necessary module permissions for the specified user to access all the modules.)

&nbsp;

<hr />

## Appendix: other Stripes CLI operations

To list modules currently installed, including the version-numbers that are part of their IDs:

	$ stripes mod list
	folio_checkin-1.4.1000111
	folio_checkout-1.5.1000236
	folio_circulation-1.4.1000170
	...
	$ 

To see what would happen if you removed a module (i.e. which other
modules would be automatically removed because they depend on it):

	$ echo mod-users-bl-4.3.3-SNAPSHOT.52 | stripes mod install --action disable --simulate | grep '"id":'
	    "id": "folio_stripes-core-3.0.1000492",
	    "id": "folio_users-2.19.1000561",
	    "id": "mod-users-bl-4.3.3-SNAPSHOT.52",
	$ 

Or to simply see what modules depend on a specified interface:

	$ stripes mod list --require users-bl
	folio_stripes-core-3.0.1000492
	folio_users-2.19.1000561
	$ 

(Note that this is not the same thing as depending on a _module_: in FOLIO, modules depend on interfaces, and interfaces are provided by other modules. A module can provide more than one interface.)

If you modify the parts of a UI module's package file that influence the module descriptor (e.g. by adding an Okapi dependency), then you need to disable, remove, re-add, and re-enable the module:

	stripes mod disable
	stripes mod remove
	stripes mod add --strict
	stripes mod enable

(The `mod disable` command works well with UI modules since nothing else depends on them. A better way to disable server-side modules, including all their dependents, is to use Okapi's install endpoint with `stripes mod install --action disable`.)

