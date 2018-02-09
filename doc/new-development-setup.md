# Creating a new development setup for Stripes

<!-- md2toc -l 2 new-development-setup.md -->
* [Introduction](#introduction)
* [TL;DR](#tldr)
* [Instructions](#instructions)
    * [Remove your old source directory](#remove-your-old-source-directory)
    * [Make a new source directory](#make-a-new-source-directory)
    * [Clone stripes-core](#clone-stripes-core)
    * [Clone all the stripes modules and apps](#clone-all-the-stripes-modules-and-apps)
    * [Configure the FOLIO NPM-CI registry](#configure-the-folio-npm-ci-registry)
    * [Yarn install](#yarn-install)
    * [Install the Stripes CLI](#install-the-stripes-cli)
    * [Run your development code!](#run-your-development-code)
* [Troubleshooting](#troubleshooting)
    * [Inventory (or another module) is missing](#inventory-or-another-module-is-missing)
    * [leveldown](#leveldown)
* [Summary](#summary)


## Introduction

Sometimes, due to the vagaries of NPM and Yarn, it becomes necessary to blow away an existing Stripes development setup and make a new one. This document walks through the steps required in this process.

## TL;DR

The following code will create a new working directory named `stripes`, clone the relevant repositories into it, install their dependencies, configure the @folio NPM registry, install the `stripescli` npm package for running stripes, and start that server running at [localhost:8080](http://localhost:8080). Just paste it into your terminal:

```
mkdir stripes
cd stripes
git clone git@github.com:folio-org/stripes-core.git
./stripes-core/util/configure
cd ./stripes-sample-platform
stripescli serve
```

## Instructions

### Remove your old source directory

First, of course, be sure that you have no uncommitted or unpushed changes. Once you have safely committed and pushed everything, you can remove the directory:

```
$ rm -rf stripes
```

### Make a new source directory

```
$ mkdir stripes
```

### Clone stripes-core

You need this first, so that you can use utility scripts included in it to help with the rest of the process. So:

```
$ cd stripes
$ git clone git@github.com:folio-org/stripes-core.git
Cloning into 'stripes-core'...
remote: Counting objects: 6199, done.
remote: Compressing objects: 100% (87/87), done.
remote: Total 6199 (delta 72), reused 99 (delta 49), pack-reused 6063
Receiving objects: 100% (6199/6199), 1.48 MiB | 3.02 MiB/s, done.
Resolving deltas: 100% (4240/4240), done.
```

### Clone all the stripes modules and apps

You can do this using the `-c` option of the ubiquitous `pull-stripes` script from stripes-core:

```
$ ./stripes-core/util/pull-stripes -c
Cloning into 'stripes-connect'...
remote: Counting objects: 1540, done.
remote: Total 1540 (delta 0), reused 0 (delta 0), pack-reused 1540
[...]
```

You _may_ find that, for reasons which are completely opaque to me, a `stripes-sample-platform` directory appears, empty but for a `node_modules` directory, at some point prior to the proper cloning of this directory. You don't want this, so blow it away and clone a real one:

```
$ rm -rf stripes-sample-platform
$ git clone git@github.com:folio-org/stripes-sample-platform.git
```

### Configure the FOLIO NPM-CI registry

Official releases of FOLIO modules are published to https://repository.folio.org/repository/npm-folio/. Between official releases, tip-of-master builds of each module are published to the continuous-integration registry, https://repository.folio.org/repository/npm-folioci/. In development, it is good practice to use the CI registry in order to replicate this environment for when you're running tests and you want to alias only the repository you've made changes to and you want tip-of-master builds for everything else.

```
$ npm config set @folio:registry https://repository.folio.org/repository/npm-folioci/
```

### Yarn install

The ecosystem for getting dependencies installed efficiently and reliably is poor. The best solution seems to be [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/), which stores shared dependencies in a single, higher-level `node_modules` directory and avoids the rat's nest of symlinks we saw with individually `yarn link`ing our locally installed repositories. To use yarn workspaces, create a `package.json` file with entry globs for the cloned repositories, then run `yarn`. You can do this with the "build" option of `pull-stripes`:

```
$ ./stripes-core/util/pull-stripes -b
```

or run the commands manually:

```
$ cat "{
    "private": true,
    "workspaces": [
        "stripes-*",
        "ui-*"
    ],
    "dependencies": {
    }
}" > package.json
$ yarn
yarn install v1.3.2
info No lockfile found.
warning Missing name in workspace at "/Users/zburke/projects/foo/stripes-demo-platform", ignoring.
warning Missing name in workspace at "/Users/zburke/projects/foo/stripes-sample-platform", ignoring.
[1/4] 🔍  Resolving packages...
[...]
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[...]
[4/4] 📃  Building fresh packages...
success Saved lockfile.
✨  Done in 139.91s.
```

### Install the Stripes CLI

The Stripes CLI, among its other benefits, manages module aliases during the build process, in parallel with how `yarn workspaces` point to locally installed modules during the development process. (`yarn link` tries to do both of these jobs, but it makes a mess of both. Avoid it like the plague.) Note that `stripescli` is not (yet) officially released so it is only available through the `npm-folioci` registry.

```
$ yarn global add @folio/stripes-cli
```

### Run your development code!

In `stripes-sample-platform` (or whatever platform directory of your own you prefer to use), make a `stripes.config.js` file, or taking priority over that if present a `stripes.config.js.local`. (The simplest way to make the latter file is to copy the former from `stripes-sample-platform`, and edit it as required.)

Then make a `.stripesclirc` containing whatever stripes aliases you want. (The simplest way to make this is to copy the `.stripesclirc.example` from `stripes-sample-platform`, and edit it as required.)

Then you can serve your development copy of Stripes using the CLI:

```
$ stripescli serve
```

## Troubleshooting

### Inventory (or another module) is missing

> **Note. This should no longer occur, now that we are not using `yarn link`.**

```
error An unexpected error occurred:
"https://repository.folio.org/repository/npm-folio/@folio%2finventory: Package '@folio/inventory' not found".
```

This is due to a combination of two things: one is that [yarn-linked packages are not used if there is no already-released version](https://github.com/yarnpkg/yarn/issues/5298), a long-standing bug. The other is that, for reasons that are not clear, the Inventory UI module has yet to be released.

Clearly yarn should not care whether or not it's possible to find a release of a linked module. But since it does, the simple work-around is to point to the `folioci` NPM repository instead of the regular `folio` repository. This contains releases of all the UI modules in the `folio-org` GitHub area, and allows yarn to ignore those releases and use the linked module. Before trying to `yarn install`, use:

```
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
```

### leveldown

This can happen when building NPM packages, notably `stripes-cli`:

```
error /private/tmp/t/stripes-cli/node_modules/leveldown: Command failed.
Exit code: 127
Command: prebuild-install || node-gyp rebuild
```

We have no idea what causes this, but it seems that `node-gyp`, whatever that is, knows how to patch up the problem. So globally install that program, and things more or less work out, probably. Before trying to `yarn install`, use:

```
$ yarn global add node-gyp
```

## Summary

```
$ rm -rf stripes
$ mkdir stripes
$ cd stripes
$ git clone git@github.com:folio-org/stripes-core.git
$ ./stripes-core/util/pull-stripes -c
$ rm -rf stripes-sample-platform
$ git clone git@github.com:folio-org/stripes-sample-platform.git
$ ./stripes-core/util/pull-stripes -b
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
$ yarn global add @folio/stripes-cli
$ cd stripes-sample-platform
$ cp stripes.config.js stripes.config.js.local
$ $EDITOR stripes.config.js.local
$ cp .stripesclirc.example .stripesclirc
$ $EDITOR .stripesclirc
$ stripescli serve
```
