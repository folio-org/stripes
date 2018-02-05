# Creating a new development setup for Stripes

<!-- md2toc -l 2 new-development-setup.md -->
* [Introduction](#introduction)
* [Instructions](#instructions)
    * [Remove your old source directory](#remove-your-old-source-directory)
    * [Make a new source directory](#make-a-new-source-directory)
    * [Clone stripes-core](#clone-stripes-core)
    * [Clone all the stripes modules and apps](#clone-all-the-stripes-modules-and-apps)
    * [Install the Stripes CLI](#install-the-stripes-cli)
    * [Yarn install](#yarn-install)
    * [Run your development code!](#run-your-development-code)
* [Troubleshooting](#troubleshooting)
    * [Inventory (or another module) is missing](#inventory-or-another-module-is-missing)
    * [leveldown](#leveldown)
* [Summary](#summary)


## Introduction

Sometimes, due to the vagaries of NPM and Yarn, it becomes necessary to blow away an existing Stripes development setup and make a new one. This document walks through the steps required in this process.

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

### Install the Stripes CLI

The Stripes CLI, among its other benefits, manages Stripes aliases. These take the place of Yarn links, poviding a much more stable and predictable devleopment environment. To make the Stripes CLI `stripescli` available:

```
$ cd stripes-cli
$ npm install -g
$ cd ..
```

Why are we installing with NPM instead of Yarn? Yarn is generally better (faster and more predictable), but inexplicably lacks a global install command: `yarn global install` does not exist. We we use NPM global install.

### Yarn install

You need to do this in each source directory. As before, there's a script for this, and it's our old friend `pull-stripes` with the `-b` ("build") option:

```
$ ./stripes-core/util/pull-stripes -b
=== stripes-connect (master) ===
Already up-to-date.
yarn install v1.3.2
info No lockfile found.
[1/5] 🔍  Validating package.json...
[...]
```

(Note that this pulls recent changes to each package and then builds the result. Perhaps the two operations should be completely separate. Perhaps `pull-stripes -b` should be a completely different script from `pull-stripes`.)

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

Clearly yarn should not care whether or not it's posible to find a release of a linked module. But since it does, the simple work-around is to point to the `folioci` NPM repository instead of the regular `folio` repository. This contains releases of all the UI modules in the `folio-org` GitHub area, and allows yarn to ignore those releases and use the linked module. Before trying to `yarn install`, use:

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
$ yarn global add node-gyp
$ cd stripes-cli
$ npm install -g
	should be `yarn global install` but this does not exist
$ cd ..
$ ./stripes-core/util/pull-stripes -b
$ cd stripes-sample-platform
$ cp stripes.config.js stripes.config.js.local
$ $EDITOR stripes.config.js.local
$ cp .stripesclirc.example .stripesclirc
$ $EDITOR .stripesclirc
$ stripescli serve
```


