# Creating a new development setup for Stripes

<!-- md2toc -l 2 new-development-setup.md -->
* [Introduction](#introduction)
* [Instructions](#instructions)
    * [Remove your old source directory](#remove-your-old-source-directory)
    * [Make a new source directory](#make-a-new-source-directory)
    * [Clone stripes-core](#clone-stripes-core)
    * [Clone all the stripes modules and apps](#clone-all-the-stripes-modules-and-apps)
    * [Yarn linking (eek!)](#yarn-linking-eek)
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


### Yarn linking (eek!)

Yarn linking is horrible and error-prone and unpredictable, and is in fact the main reason why we need a procedure for replacing decayed Stripes development environments at all. There is another utility script that helps with this.

First, establish the linkability of the various Stripes packages and the UI modules:

```
$ ./stripes-core/util/link-stripes -i
Initialising
* Initialising linkability for 'stripes-cli'
yarn link v1.3.2
success Registered "@folio/stripes-cli".
[...]
```

Then set up the inter-package links:
```
$ ./stripes-core/util/link-stripes
```

(Yes, that is the same utility script used for both steps. Use the `-i` option the first time, but not the second.)


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

(Note that this pulls recent changes to each package and then builds the result. Perhaps the two operations should be completely separate. Perhaps `pull-stripes -b` should be a completely different script from `pull-stripes`. Maybe `link-stripes -i` should be a different script from `link-stripes`. Maybe the two modes of `link-stripes` should be two more options to `pull-stripes`. None of this is pretty.)

### Run your development code!

This is done in the usual way: in `stripes-sample-platform`, copy `stripes.config.js` to `stripes.config.js.local`, edit the latter as required, and then:

```
$ yarn start
```


## Troubleshooting

### Inventory (or another module) is missing

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
$ ./stripes-core/util/link-stripes -i
$ ./stripes-core/util/link-stripes
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
$ yarn global add node-gyp
$ ./stripes-core/util/pull-stripes -b
$ cd stripes-sample-platform
$ cp stripes.config.js stripes.config.js.local
$ $EDITOR stripes.config.js.local
$ yarn start
```


