# Stripes release procedure

<!-- ../../okapi/doc/md2toc -l 2 release-procedure.md -->
* [Version numbers, branches and tags](#version-numbers-branches-and-tags)
* [Release procedure](#release-procedure)
* [Notes on dependencies](#notes-on-dependencies)
* [Notes on testing](#notes-on-testing)
* [While working towards the next release](#while-working-towards-the-next-release)
* [Note on access to the NPM repository](#note-on-access-to-the-npm-repository)

NOTE. This document is subject to revision.


## Version numbers, branches and tags

The libraries that make up Stripes adhere to [the FOLIO
version-numbering scheme](http://dev.folio.org/community/contrib-code#version-numbers), which is essentially identical to [Semantic Versioning](http://semver.org/). All releases are tagged in git.

Each release is tagged with a name beginning with `v` and followed by the version number -- for example, `v2.3.5`.

Patch releases can be done on a branch whose name begins with `b` and is followed by the major and minor version -- for example, `b2.3`. From this branch, we will make some number of tagged releases, each with a different trivial version number (one for each patch release: bug-fixes and security patch, for example, `v2.3.1`). If no such branch exists for the minor version you're seeking to patch and `master` has since moved on with commits you prefer not to include, please create a branch from the tag.


## Release procedure

* Increment the version number in `package.json`, if this has not already been done -- bumping the major version if there are backwards-incompatible changes, and the minor version if all changes are backwards-compatible.
* Add an entry to the project's `CHANGELOG.md` describing how the new release differs from the previous one. The purpose of the change-log is to allow a module developer to answer the question "Do I need to upgrade to the new version of this package?", so aim for a high-level overview rather than enumerating every change, and concentrate on API-visible rather then internal changes.
* Commit the `package.json` and `CHANGELOG.md` changes with the message "Release v2.3.0".
* Create a tag for the specific version to be released -- for example, `v2.3.0`.
* Publish the package to the npm repository using `npm publish`. (You will need credentials to do this: see note below.)
* Push the changed module back to git (`git push`).
* Push the new release tag back to git (`git push origin tag v2.3.0`).


## Notes on dependencies

* Each stripes platform (`stripes-sample-platform`, etc.) depends directly on `stripes-core` and a set of application modules.
* Each application module (`users`, `items`, etc.) has `stripes-core` as a peer-dependency.
* `stripes-core` depends directly on `stripes-connect`, `stripes-components`, etc.
* [**Optional.** Guerilla dependencies. Application modules, such as Users and Items, that consume the released module's API and need the new facility should update the relevant peer-dependency to their `package.json`, specifying the new version. In general, Stripes modules should use the widest possible range of version compatibility for the packages they depend on.]


## Notes on testing

XXX to be done. See http://dev.folio.org/doc/automation


## While working towards the next release

After making a release, the version number in the `master` branch's `package.json` should be incremented ready for the next version. Initially, the minor version should be bumped. At this point, any number of non-breaking changes may be made before the next release. If in this process a breaking change is made, the major version should be bumped; thereafter, any number of breaking changes may be made before the next release.

As soon as you make API-visible changes, start adding them to a new entry in the change-log. But do not include a date for the entry: instead, mark it as "IN PROGRESS", as in [the in-progress `stripes-core` change-log from before v0.5.0](https://github.com/folio-org/stripes-core/blob/e058702cb19b32f607f7fb40b15ddf00cd6b45ad/CHANGELOG.md).

## Note on access to the NPM repository

Before you can do `yarn publish`, you will need access to the Index Data/FOLIO NPM repository at `repository.folio.org`. Get these credentials from an administrator. Once you have them, login as follows:
```
$ npm config set @folio:registry https://repository.folio.org/repository/npm-folio/
$ npm adduser --registry=https://repository.folio.org/repository/npm-folio/
Username: mike
Password: ********
Email: (this IS public) mike@indexdata.com
Logged in as mike on https://repository.folio.org/repository/npm-folio/.
$ 
```
You will then be able to release packages in the relevant repository:
```
$ npm publish
+ @folio/stripes-components@0.0.2
$ 
```
