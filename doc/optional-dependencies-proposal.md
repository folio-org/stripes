# Proposal: optional dependencies in Stripes apps

<!-- md2toc -l 2 optional-dependencies-proposal.md -->
* [Background](#background)
* [The present process](#the-present-process)
* [Proposal](#proposal)
* [Implications](#implications)


## Background

FOLIO is designed from the ground up to to be modular system, and this is one of its main selling points. But in practice, FOLIO systems tend to be rather monolithic. For example, including the Users app pulls in all the following back-end modules (and their dependencies):

* mod-users
* mod-users-bl
* mod-circulation
* mod-permissions
* mod-login
* mod-feesfines
* mod-configuration
* [mod-circulation-storage](http://folio-registry.aws.indexdata.com/_/proxy/modules?provide=loan-policy-storage&latest=1)

This is rather monolithic for a module system. In particular it seems wrong for a non-circulating library to need mod-circulation.


## The present process

Here's how this works.

**Step 1.** The package file for the ui-users app includes a section called `okapiInterfaces`, specifying which interfaces it needs to be provided, and the version numbers of each that it needs. (These are interpreted according to standard [semantic versioning](https://semver.org/) rules.) For example:

	"okapiInterfaces": {
	  "users": "15.0",
	  "configuration": "2.0",
	  "circulation": "3.0 4.0 5.0 6.0 7.0",
	  "permissions": "5.0",
	  "loan-policy-storage": "1.0 2.0",
	  "loan-storage": "4.0 5.0",
	  "login": "4.7 5.0",
	  "feesfines": "15.0",
	  "request-storage": "2.5 3.0",
	  "users-bl": "3.2 4.0"
	},

**Step 2.** As part of the build process for a FOLIO node, the `stripes mod descriptor` translates parts of the app's package file, including the `okapiInterfaces` specification, into a module descriptor.

**Step 3.** This module descriptor is then posted to Okapi, in part so that any application-level permission sets are registered. At this stage, if Okapi doesn't already have modules to hand that implement the required interfaces, it rejects the posting.

Because in practice it's not really acceptable for the app not to get registered -- its permissions are needed -- what tends to happen is that the descriptor generation process of step 2 is run in a non-strict mode where the interface dependencies are omitted from the descriptor. This does mean that you can run the Users app without needing mod-circulation; but it also means that the `okapiInterfaces` declarations are effectively useless.


## Proposal

In order to discourage the use of non-strict mode in descriptor generation, and so bring back meaning to the `okapiInterfaces` specification, we need to separate out _required_ dependencies from _desired_ dependencies. We can then routinely use strict mode when generating module descriptors, basing them only on the required dependencies.

In the case of the Users app, the `users` interface is required, but the `circulation` interface is only desired. So the Users app will, quite rightly, not be deployable if mod-users is not available; but it will run happily if mod-circulation is not available, as in the case of a non-circulating library.

How to do this? We simply introduce another element into the package file of apps, `desiredDependencies`, with exactly the same structure as the existing `okapiInterfaces`, and move the optional interfaces from the old structure to the new.

The implementation effort required for this is: zero. Step 2 of the build process outlined above will simply ignore the new `desiredDependencies` element, which is what we want.

What, then, is the point of `desiredDependencies`? Why not just omit these dependencies from the package file completely? We will want them to drive the app-store when that finally gets built. When someone selects the Users app, the store will be able to say "Did you know this app can integrate with circulation? If you want to do that, make sure you also get the circulation module".


## Implications

We have tried to make UI modules robust against the absence of interfaces using `<IfInterface>` (and also robust against the absence of permissions using `<IfPermission>`). For example, the Users app already contains [this code](https://github.com/folio-org/ui-users/blob/28b0d5785ba4b1b86f6c7827251d4394c1c3731c/src/ViewUser.js#L1041-L1051):

	<IfInterface name="circulation">
	  <this.connectedUserLoans
	    onClickViewLoanActionsHistory={this.onClickViewLoanActionsHistory}
	    onClickViewOpenLoans={this.onClickViewOpenLoans}
	    onClickViewClosedLoans={this.onClickViewClosedLoans}
	    expanded={this.state.sections.loansSection}
	    onToggle={this.handleSectionToggle}
	    accordionId="loansSection"
	    {...this.props}
	  />
	</IfInterface>

But apps are not always as careful about this as they should be, and indeed there are other places in the Users app where it assumes circulation is available and does not protect accesses to the relevant interfaces.

So in general, enhancing an app to work correctly in the absence of an optional interface will involve some work. (It will also be necessary to ensure that the module-level integration test works correctly on platforms that lack the optional module.)

We can, however, make these changes one by one as needed -- as for example when we first encounter a library that does not circulate. That will be the moment to ensure that the Users app is circulation-clean, as we really do not want to have to tell such customers "You have to have mod-circulation, even though you never use it".

And new modules can be written with this in mind from the start.


