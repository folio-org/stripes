# Creating a new development setup for Stripes

<!-- md2toc -l 2 new-development-setup.md -->
* [Introduction](#introduction)
* [TL;DR](#tldr)
* [Instructions](#instructions)
* [Update your VM](#update-your-vm)
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
    * [stripescli install is not idempotent](#stripescli-install-is-not-idempotent)
* [Summary](#summary)
* [An alternative approach to setting up a development environment](#an-alternative-approach-to-setting-up-a-development-environment)
    * [Introduction](#introduction)
    * [Configure yarn](#configure-yarn)
    * [Create a workspace](#create-a-workspace)
    * [Use `stripes-cli` from your workspace](#use-stripes-cli-from-your-workspace)


## Introduction

Sometimes, due to the vagaries of NPM and Yarn, it becomes necessary to blow away an existing Stripes development setup and make a new one. This document walks through the steps required in this process.

## TL;DR

Make sure you are running against the most-recent version of the `testing-backend` box; yes, it's bleeding edge, but anything else is likely out of sync with the front-end modules. You must `vagrant destroy` an existing VM for `vagrant up` to find and install a new version; `vagrant halt; vagrant up` is not sufficient.

The following code will create a new working directory named `stripes`, clone the relevant repositories into it, install their dependencies, configure the @folio NPM registry, install the `stripes` npm package for running stripes, and start that server running at [localhost:8080](http://localhost:8080). Just paste it into your terminal:

```
mkdir stripes
cd stripes
git clone https://github.com/folio-org/stripes-core
./stripes-core/util/configure
cd ./stripes-sample-platform
stripes serve
```

## Instructions

## Update your VM

Use the most-recent version of the `testing-backend` Vagrant VM to run Okapi. Other VMs, such as `stable`, are likely out of sync with the front-end modules. If you are starting from scratch, create a directory named `testing-backend` with a `Vagrantfile` inside it and then install the machine:

```
$ mkdir testing-backend
$ cd testing-backend
$ echo "Vagrant.configure("2") do |config|
  config.vm.box = "folio/testing-backend"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 8192
  end
end" >> Vagrantfile
$ vagrant up
Bringing machine 'default' up with 'virtualbox' provider...
==> default: Checking if box 'folio/testing-backend' is up to date...
==> default: Clearing any previously set forwarded ports...
==> default: Clearing any previously set network interfaces...
==> default: Preparing network interfaces based on configuration...
   default: Adapter 1: nat
==> default: Forwarding ports...
   default: 9130 (guest) => 9130 (host) (adapter 1)
   default: 22 (guest) => 2222 (host) (adapter 1)
==> default: Running 'pre-boot' VM customizations...
==> default: Booting VM...
==> default: Waiting for machine to boot. This may take a few minutes...
   default: SSH address: 127.0.0.1:2222
   default: SSH username: vagrant
   default: SSH auth method: private key
==> default: Machine booted and ready!
[default] GuestAdditions versions on your host (5.2.0) and guest (4.3.36) do not match.
Reading package lists...
Building dependency tree...
Reading state information...
dkms is already the newest version.
linux-headers-3.16.0-4-amd64 is already the newest version.
The following packages were automatically installed and are no longer required:
 comerr-dev gyp javascript-common krb5-multidev libc-ares-dev libc-ares2
 libjs-jquery libjs-node-uuid libjs-underscore libssl-dev libssl-doc
 libv8-3.14-dev libv8-3.14.5 zlib1g-dev
Use 'apt-get autoremove' to remove them.
0 upgraded, 0 newly installed, 0 to remove and 70 not upgraded.
Copy iso file /Applications/VirtualBox.app/Contents/MacOS/VBoxGuestAdditions.iso into the box /tmp/VBoxGuestAdditions.iso
Mounting Virtualbox Guest Additions ISO to: /mnt
mount: /dev/loop0 is write-protected, mounting read-only
Installing Virtualbox Guest Additions 5.2.0 - guest version is 4.3.36
Verifying archive integrity... All good.
Uncompressing VirtualBox 5.2.0 Guest Additions for Linux........
VirtualBox Guest Additions installer
This system appears to have a version of the VirtualBox Guest Additions
already installed.  If it is part of the operating system and kept up-to-date,
there is most likely no need to replace it.  If it is not up-to-date, you
should get a notification when you start the system.  If you wish to replace
it with this version, please do not continue with this installation now, but
instead remove the current version first, following the instructions for the
operating system.

If your system simply has the remains of a version of the Additions you could
not remove you should probably continue now, and these will be removed during
installation.

Do you wish to continue? [yes or no]

Cancelling installation.
An error occurred during installation of VirtualBox Guest Additions 5.2.0. Some functionality may not work as intended.
In most cases it is OK that the "Window System drivers" installation failed.
Failed to start vboxadd.service: Unit vboxadd.service failed to load: No such file or directory.
Unmounting Virtualbox Guest Additions ISO from: /mnt
==> default: Checking for guest additions in VM...
   default: The guest additions on this VM do not match the installed version of
   default: VirtualBox! In most cases this is fine, but in rare cases it can
   default: prevent things such as shared folders from working properly. If you see
   default: shared folder errors, please make sure the guest additions within the
   default: virtual machine match the version of VirtualBox you have installed on
   default: your host and reload your VM.
   default:
   default: Guest Additions Version: 4.3.36
   default: VirtualBox Version: 5.2
==> default: Mounting shared folders...
   default: /vagrant => /Users/zburke/projects/testing-backend
==> default: Machine already provisioned. Run `vagrant provision` or use the `--provision`
==> default: flag to force provisioning. Provisioners marked to run always will still run.
$ cd ..
```

If you have an existing VM running and want to update it, you *must* destroy the existing VM in order to pick up the new box. Running `vagrant halt; vagrant box update; vagrant up` will have *no effect*.
```
$ cd testing-backend
$ vagrant destroy -f
$ vagrant box update
==> default: Checking for updates to 'folio/testing-backend'
    default: Latest installed version: 5.0.0-20180212.450
    default: Version constraints:
    default: Provider: virtualbox
==> default: Updating 'folio/testing-backend' with provider 'virtualbox' from version
==> default: '5.0.0-20180212.450' to '5.0.0-20180215.456'...
==> default: Loading metadata for box 'https://vagrantcloud.com/folio/testing-backend'
==> default: Adding box 'folio/testing-backend' (v5.0.0-20180215.456) for provider: virtualbox
    default: Downloading: https://vagrantcloud.com/folio/boxes/testing-backend/versions/5.0.0-20180215.456/providers/virtualbox.box
==> default: Successfully added box 'folio/testing-backend' (v5.0.0-20180215.456) for 'virtualbox'!
$ vagrant up
[...]
$ cd ..
```
A box file is like a template for a VM, and like a document created from a template, a VM created from a box file will not be affected by future changes to the box file.

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
$ git clone https://github.com/folio-org/stripes-core
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
$ git clone https://github.com/folio-org/stripes-sample-platform
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

The Stripes CLI, among its other benefits, manages module aliases during the build process, in parallel with how `yarn workspaces` point to locally installed modules during the development process. (`yarn link` tries to do both of these jobs, but it makes a mess of both. Avoid it like the plague.) Note that `stripes` is not (yet) officially released so it is only available through the `npm-folioci` registry.

```
$ yarn global add @folio/stripes-cli
```

### Run your development code!

In `stripes-sample-platform` (or whatever platform directory of your own you prefer to use), make a `stripes.config.js` file, or taking priority over that if present a `stripes.config.js.local`. (The simplest way to make the latter file is to copy the former from `stripes-sample-platform`, and edit it as required.)

Then make a `.stripesclirc` containing whatever stripes aliases you want. (The simplest way to make this is to copy the `.stripesclirc.example` from `stripes-sample-platform`, and edit it as required.)

Then you can serve your development copy of Stripes using the CLI:

```
$ stripes serve
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

### stripescli install is not idempotent

Updating stripescli sometimes fails with odd errors:
```
npm ERR! path /usr/local/lib/node_modules/@folio/stripes-cli/node_modules/ansi-regex/package.json.1410820166
npm ERR! code ENOENT
npm ERR! errno -2
npm ERR! syscall open
npm ERR! enoent ENOENT: no such file or directory, open '/usr/local/lib/node_modules/@folio/stripes-cli/node_modules/ansi-regex/package.json.1410820166'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent
```
or
```
Error: Cannot find module 'yargs'
```
This can happen if you are installing over the top of an existing installation from source (e.g. running `npm install -g` multiple times) or if you are switching from an install from source using npm to an install from the @npm-folioci registry using yarn. Uninstall, then reinstall. For yarn:
```
$ yarn global remove @folio/stripes-cli
$ yarn global add @folio/stripes-cli
```
For npm:
```
$ cd stripes-cli
$ npm uninstall -g
$ npm install -g
```

## Summary

```
$ rm -rf stripes
$ mkdir stripes
$ cd stripes
$ git clone https://github.com/folio-org/stripes-core
$ ./stripes-core/util/pull-stripes -c
$ rm -rf stripes-sample-platform
$ git clone https://github.com/folio-org/stripes-sample-platform
$ ./stripes-core/util/pull-stripes -b
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
$ yarn global add @folio/stripes-cli
$ cd stripes-sample-platform
$ cp stripes.config.js stripes.config.js.local
$ $EDITOR stripes.config.js.local
$ cp .stripesclirc.example .stripesclirc
$ $EDITOR .stripesclirc
$ stripes serve
```

## An alternative approach to setting up a development environment

### Introduction

When developing an app or two, it's simplest to launch them independently with [stripes-cli](https://github.com/folio-org/stripes-cli/) installed globally via `yarn global add`. However, if you are actively developing multiple apps, platforms, and also working on changes to core packages, it may be easier to manage with a [yarn workspace](https://yarnpkg.com/en/docs/workspaces/). This allows packages to share a common `node_modules` directory for their dependencies and preferentially use other git checkouts you have within the workspace structure, eg. everything in the workspace will use your local copy of `stripes-core`.

### Configure yarn

You'll want to use the CI packages for any Stripes software you're not running from git. These are built regularly from the `master` branch whereas the released packages may be too far behind the git versions. To do this for packages in the `@folio` namespace add this to your `.yarnrc`:
```
"@folio:registry" "https://repository.folio.org/repository/npm-folioci/"
```

I find that yarn tends to rebuild native binaries rather more often that it really needs to. Since this can take some time, I was pleased to see that v1.5.1 has added a new feature to cache the build artifacts. In order to take advantage of it, you'll need to enable the offline cache generally for which you'll need to make a directory (`/some/path/yarn-offline-cache` below, but can be anything). The relevant `.yarnrc` settings are:
```
experimental-pack-script-packages-in-mirror true
pack-built-packages true
yarn-offline-mirror "/some/path/yarn-offline-cache"
```

### Create a workspace

A workspace is a directory with a `package.json` specifying which of the directories underneath it are to share a common `node_modules` dir. If you don't use it for anything else, you can indicate this with a wildcard, resulting in `package.json` containing simply:
```
{
  "private": true,
  "workspaces": [ "*" ],
  "dependencies": {}
}
```

You can then check out any packages you're working on as subdirectories and `yarn install` will arrange their dependencies and ensure they see each other. Dependencies that refer to a specific version that differs from the rest will be placed in `node_modules` under the requesting package's directory but the majority are hopefully shared at the top level. Note that all packages need, at minimum, a name and version or they will be ignored with a warning. Conveniently, `yarn outdated` and `yarn upgrade` also work at the workspace level for all packages.

If you have checked out a platform, `folio-testing-platform` for example, you can `cd` to it and run `yarn start` or `yarn build` as usual (N.B. may require NodeJS 9.x or later).

### Use `stripes-cli` from your workspace

Since `stripes-cli` makes use of `stripes-core` and `ui-testing`, I prefer to install it in my workspace rather than globally so that it sees my local changes to those packages and doesn't need to bring in a bunch of duplicate copies of the dependency tree. To that end I have aliased the `stripes` command in my `~/.bash_aliases` (for shells other than Bash, it'll be similar yet different):
```
alias stripes='node /path/to/my/workspace/node_modules/.bin/stripes $*'
```

Currently I have `stripes-cli` as a dependency on my local development platform so it's brought in via NPM. Were I impatient to try a new feature, I could check `stripes-cli` out into my workspace and `yarn install`. My alias would now be using my local checkout--yarn keeps symlinks in `.bin` for packages in the workspace too.

Speaking of new features, `stripes-cli` will soon be able to pull new changes from the repos in your workspace with `stripes pull`.
