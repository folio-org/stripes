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

You _may_ find that, for reasons which are completely opaque to me, a `stripes-sample-platform` directory also appears, empty but for a `node_modules` directory. You don't want this, as you are about to clone a proper one. So blow it away:

```
$ rm -rf stripes-sample-platform
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

## Summary

```
$ rm -rf stripes
$ mkdir stripes
$ cd stripes
$ git clone git@github.com:folio-org/stripes-core.git
$ rm -rf stripes-sample-platform
$ ./stripes-core/util/pull-stripes -c
$ ./stripes-core/util/link-stripes -i
$ ./stripes-core/util/link-stripes
$ ./stripes-core/util/pull-stripes -b
$ cd stripes-sample-platform
$ cp stripes.config.js stripes.config.js.local
$ $EDITOR stripes.config.js.local
$ yarn start
```
