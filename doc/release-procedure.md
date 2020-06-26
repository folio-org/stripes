# Stripes release procedure

<!-- md2toc -l 2 release-procedure.md -->
* [Version numbers, branches and tags](#version-numbers-branches-and-tags)
* [Before you release](#before-you-release)
    * [Check dependencies](#check-dependencies)
* [Release procedure](#release-procedure)
* [Working towards the next release](#working-towards-the-next-release)
* [Backporting bug-fix releases](#backporting-bug-fix-releases)
* [Notes on breaking changes](#notes-on-breaking-changes)
* [Notes on dependencies](#notes-on-dependencies)
* [Notes on testing](#notes-on-testing)
* [Publishing to NPM via Jenkins](#publishing-to-npm-via-jenkins)
* [Direct access to the NPM repository](#direct-access-to-the-npm-repository)

NOTE. This document is subject to revision.


## Version numbers, branches and tags

The libraries that make up Stripes adhere to [the FOLIO
version-numbering scheme](https://dev.folio.org/guidelines/contributing/#version-numbers), which is essentially identical to [Semantic Versioning](http://semver.org/). All releases are tagged in git.

Each release is tagged with a name beginning with `v` and followed by the version number -- for example, `v2.3.5`.

Patch releases can be done on a branch whose name begins with `b` and is followed by the major and minor version -- for example, `b2.3`. From this branch, we will make some number of tagged releases, each with a different trivial version number (one for each patch release: bug-fixes and security patch, for example, `v2.3.1`). If no such branch exists for the minor version you're seeking to patch and `master` has since moved on with commits you prefer not to include, please create a branch from the tag.

New modules should start at version `1.0.0` rather than `0.1.0` to avoid confusion with caret dependencies on 0.x.y releases. Although NPM's [semver rules for caret ranges](https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004) clearly state the caret "allows changes that do not modify the left-most non-zero digit", in practice folks tend to think of caret dependencies as "only the major version is fixed" because that is what it means for any version without a 0-major version. Avoiding 0-major version just avoids a heap of confusion.

## Before you release

Please make sure that your code runs clean. Specifically:

* It should pass `yarn lint` with no errors.
* It should not emit any warnings on the JavaScript console.

Make sure that your repository's `CHANGELOG.md` is up to date:

* Bullet point for each bug fixed/new feature added/etc.
* Each bullet point ends by stating the ID of the Jira issue, when there is one. If there is not, consider creating one and referencing it, but there is no need to make a religion out of this.

You may need to check the git history to ensure that all major changes are covered by the change-log entries.

Ensure that each of the Jira issues listed in the change-log is tagged to the number of the release that it's going to be a part of. Issues are generally tagged to the minor release following the most recently released versions, but will need to be re-targeted to the next _major_ release if a backwards-incompatible change is to be included.

### Check dependencies

Make sure your `package.json` does not contain any unreleased dependencies -- for example, a bugfix version of stripes-core that adds a new facility, available via the CI repository `folioci` but not from an actual release. To check for this, make a brand new checkout of the module you're working on, outside of any Yarn workspace, switch back to the `npm-folio` registry, and try to install.
```
$ mkdir /tmp/fresh-build
$ cd /tmp/fresh-build
$ git clone git@github.com:folio-org/ui-developer.git
$ cd ui-developer
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
$ yarn install
```

Messages received during the install such as, "Package [package] not found" or
"Couldn't find any versions for [package] that matches [version]", indicate an unreleased dependency. Please ensure those dependencies are properly released to `npm-folio` before continuing.


## Release procedure

* Create a branch to contain the release-related changes to `package.json` and `CHANGELOG.md`, e.g. `git checkout -b b2.3`.
* Increment the version number in `package.json`, if this has not already been done -- bumping the major version if there are backwards-incompatible changes, and the minor version if all changes are backwards-compatible.
* Make any necessary additions to the project's `CHANGELOG.md` describing how the new release differs from the previous one. The purpose of the change-log is to allow a module developer to answer the question "Do I need to upgrade to the new version of this package?", so aim for a high-level overview rather than enumerating every change, and concentrate on API-visible rather than internal changes.
* Set the date of the release in `CHANGELOG.md`, adding a link to the tag and another to the full set of differences from the previous release as tracked on GitHub: follow the formatting of earlier change-log entries.
* Commit the `package.json` and `CHANGELOG.md` changes with the message "Release vVERSION". For example, `git commit -m "Release v2.3.0" .`
* Push the branch to GitHub, e.g. `git push -u origin b2.3`.
* Create a Pull Request for it, and merge it.
* After the merge, checkout the master branch and create a tag for the specific version to be released, e.g. `git checkout master; git pull; git tag v2.3.0`. If there have been other changes to master since the merge commit, supply the checksum of the merge commit to make sure the tag is applied to the correct commit, e.g. `git tag v2.3.0 c0ffee`.
* Push the release tag to git, e.g. `git push origin tag v2.3.0`.
* Build and publish release artifacts.  Log into https://jenkins-aws.indexdata.com with your folio-org Github credentials. Select the project you want to release under the GitHub 'folio-org' folder and select the 'Tags' tab. Select the Git tag you want to release and then run 'Build Now' to build the release artifacts. If the Git tag you want to release is not present, run the 'Scan Repository Now' task and reload the page when the scan is complete. (Note: You may require additional permissions to build the release. Contact a FOLIO DevOps administrator if needed.)
* Adjust configuration for this module in Stripes Platforms. Follow [Add to platforms](https://dev.folio.org/guidelines/release-procedures/#add-to-platforms) documentation.
* Send a release announcement to the `#releases` Slack [channel](https://dev.folio.org/guidelines/which-forum/#slack) if relevant.


## Working towards the next release

Decide what the version number of the next release is likely to be -- almost always a minor-version bump from the release that has just been made.

In the Jira project, create a new version with this number, so that issues can be associated with it.

Create a new entry at the top of the change-log for the forthcoming version, so there is somewhere to add entries. But do not include a date for the entry: instead, mark it as "IN PROGRESS", as in [the in-progress `stripes-core` change-log from before v0.5.0](https://github.com/folio-org/stripes-core/blob/e058702cb19b32f607f7fb40b15ddf00cd6b45ad/CHANGELOG.md).

## Patch release procedures

In short, making a patch release is not any different than making a regular release, except that you create a new branch from the last-release's commit and everything happens relative to that branch, rather than relative to `master`. For example, if you are making the first patch to the `v3.4.0`, to be published as `v3.4.1`, create a `b3.4` branch and do everything relative to that:
```
git checkout -b b3.4 <release-commit-hash-of-v3.4.0>
git push -u origin HEAD
```
For each ticket you want to include in the patch release, create a branch (as you normally would) and then use [`git cherry-pick`](https://git-scm.com/docs/git-cherry-pick) to copy those commits onto the branch. (Alternatively, you can `rebase` the original branch onto this patch branch if there are many commits and they were not squashed. `cherry-pick` is really just a manual `rebase`; in fact this is what Git does under the hood.) For example, if you are adding UIU-666 to the release:
```
git checkout -b UIU-666-patch
git cherry-pick <hash-of-commit-to-add>
```
Now you can proceed with the standard PR process: push the changes up to GitHub, create a pull request, and merge it. The only difference is that the target branch for the PR will be the release branch, `b3.4`, instead of `master`. When you are finished adding changes to the branch, make sure you pull the changes onto the release-branch, then split off a new patch-release branch `release-v3.4.1`:
```
git checkout b3.4
git pull
git checkout -b release-v3.4.1
```
At this point it's a normal release, as above: in `package.json` update the `version` to `3.4.1` and add the release date information to `CHANGELOG.md`. Again, proceed with the standard PR process to merge this branch to `b3.4`. When the PR is merged, tag and publish the release:
```
git checkout b3.4
git pull
git tag v3.4.1
git push origin tag v3.4.1
```
Finally, visit Jenkins for the repo and start a build from this `v3.4.1` tag to publish the release to NPM.

## Backporting bug-fix releases

If you are asked to (a) publish a bug-fix release and (b) backport the fix and publish a release to an earlier minor-version. YOU MUST release the backported version _first_. The `npm` command `npm publish` _automatically_ adds the dist-tag `latest` to every release. `yarn install` _ignores_ semantically later versions if the `latest` dist-tag will satisfy the version range. The practical consequence of this is that if multiple versions of a package are available, say `v3.7.1` and `3.10.1`, and `v3.7.1` has the `latest` dist-tag (because it was published most recently), and you have a dependency like `^3.5.0`, yarn will choose `v3.7.1`. If elsewhere in your platform you have a dependency like `~3.10.0`, yarn will install that version _in addition_, and now your build will contains two copies of said package.

Many app packages have a devDependency on `@folio/stripes-core` such as `"^3.5.0"` (to import certain components related to testing), in addition to a peerDependency on `@folio/stripes` such as `"^2.10.0"` which itself contains the dependency `"@folio/stripes-core": "~3.10.0"`. This collection of dependencies is susceptible to the problem above: duplicate copies of stripes-core will be included in the build, causing unit tests to fail during automated testing by Jenkins.


## Notes on breaking changes

When breaking changes have been introduced, but are not stable enough to officially release, follow Semantic Versioning's pre-release nomenclature prior to the official release. Do this with a `-pre.n` suffix where `n` represents the n-th pre-release leading up to the release.

For example, given a current release of `1.2.3` in which breaking changes must be introduced, release these changes as `2.0.0-pre.1`.  If necessary, repeat with `2.0.0-pre.2` and so on until code is deemed stable enough to release `2.0.0`.

Update dependant packages when needed to allow CI to pick up the pre-release version for integration testing.  A pre-release should be used in place of alternative references such as `latest` or a specific commit hash.  Once the final version has been released, any packages depending on the pre-release version should be updated.



## Notes on dependencies

* Each stripes platform (`stripes-sample-platform`, etc.) depends directly on `stripes-core` and a set of application modules.
* Each application module (`users`, `items`, etc.) has `stripes-core` as a peer-dependency.
* `stripes-core` depends directly on `stripes-connect`, `stripes-components`, etc.
* [**Optional.** Guerilla dependencies. Application modules, such as Users and Items, that consume the released module's API and need the new facility should update the relevant peer-dependency to their `package.json`, specifying the new version. In general, Stripes modules should use the widest possible range of version compatibility for the packages they depend on.]


## Notes on testing

XXX to be done. See https://dev.folio.org/guides/automation

## Publishing to NPM via Jenkins

1. Add a `Jenkinsfile` to your project with the following contents:
```
buildNPM {
 publishModDescriptor = ‘no’
 runLint = ‘no’
 runTest = ‘no’
}
```

2. Scope the project `name` in package.json with `@folio`, e.g. `"name": "@folio/react-intl-safe-html"`
3. Check your job in Jenkins (https://jenkins-aws.indexdata.com/job/folio-org)
