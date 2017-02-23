# Stripes release procedure

**XXX** THESE ARE NOTES IN PROGRESS.

The libraries that make up Stripes adhere to [the FOLIO
version-numbering scheme](http://dev.folio.org/community/contrib-code#version-numbers), which is essentially identical to [Semantic Versioning](http://semver.org/)

For new major and minor releases, we make a branch, whose name begins with `b` -- for example, `b2.3`. From this branch, we will make some number of tagged releases, each with a different trivial version number (one for each patch release: bug-fixes and security patch). Patch releases and are made within the same git branch, and are represented by tags beginning with `v` -- for example, `v2.3.1`.

* Increment the version number in `package.json`, if this has not already been done -- bumping the major version if there are backwards-incompatible changes, and the minor version if all changes are backwards-compatible.
* Make a release branch, named with `b` followed by the version of the new release -- for example, `b2.3`. Version 2.3.0 -- and versions 2.3.1, 2.3.2, etc. if needed -- will be made from this branch.
* If any changes specific to this release are needed, make them in the branch.
* Create a tag for the specific version to be released -- for example, `v2.3.0`.
* Publish the package to the npm repository using `yarn publish`. (You will need credentials to do this: get them from an administrator.)
* Each stripes platform depends directly on stripes-core and a set of application modules.
* Each appliation module has stripes-core as a peer-dependency.
* stripes-core depends directly on stripes-connect, stripes-components, etc.
* [**Optional.** Guerilla dependencies. Application modules, such as Users and Items, that consume the released module's API and need the new facility should update the relevant peer-dependency to their `package.json`, specifying the new version. In general, Stripes modules should use the widest possible range of version compatibility for the packages they depend on.]

XXX how do we handle the requirements of testing?

See http://dev.folio.org/doc/automation

Note on the version number within the `master` branch. After making a release, the version number in `package.json` should be incremented ready for the next version. Initially, the minor version shoulf be bumped. At this point, any number of non-breaking changes may be made before the next release. If in this process a non-breaking change is made, the major version should be bumped; thereafter, any number of breaking changes may be made before the next release.

