# Stripes release procedure

NOTE. This procedure is subject to revision.

## Version numbers, branches and tags

The libraries that make up Stripes adhere to [the FOLIO
version-numbering scheme](http://dev.folio.org/community/contrib-code#version-numbers), which is essentially identical to [Semantic Versioning](http://semver.org/)

For new major and minor releases, we make a branch, whose name begins with `b` -- for example, `b2.3`. From this branch, we will make some number of tagged releases, each with a different trivial version number (one for each patch release: bug-fixes and security patch). Patch releases are made within the same git branch, and are represented by tags beginning with `v` -- for example, `v2.3.1`.

## Release procedure

* Increment the version number in `package.json`, if this has not already been done -- bumping the major version if there are backwards-incompatible changes, and the minor version if all changes are backwards-compatible.
* Add an entry to the project's `CHANGELOG.md` decribing how the new release differs from the previous one.
* Make a release branch, named with `b` followed by the version of the new release -- for example, `b2.3`. Version 2.3.0 -- and versions 2.3.1, 2.3.2, etc. if needed -- will be made from this branch.
* If any changes specific to this release are needed, make them in the branch.
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

## Note on the version number

After making a release, the version number in the `master` branch's `package.json` should be incremented ready for the next version. Initially, the minor version should be bumped. At this point, any number of non-breaking changes may be made before the next release. If in this process a non-breaking change is made, the major version should be bumped; thereafter, any number of breaking changes may be made before the next release.

## Note on access to the NPM repository

Before you can do `yarn publish`, you will need access to the Index Data/FOLIO NPM repository at `folio-nexus.indexdata.com`. Get these credentials from an administrator. Once you have them, login as follows:
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
