# Creating a new development setup for Stripes

<!-- md2toc -l 2 new-development-setup.md -->
* [Introduction](#introduction)
* [Prerequisites](#prerequisites)
* [Summary (TL;DR)](#summary-tldr)
    * [App development summary](#app-development-summary)
    * [Platform development summary](#platform-development-summary)
* [Instructions](#instructions)
    * [Update your VM](#update-your-vm)
    * [Configure the FOLIO registry](#configure-the-folio-registry)
    * [Install Stripes CLI](#install-stripes-cli)
    * [Remove any aliased modules](#remove-any-aliased-modules)
* [Instructions for app development](#instructions-for-app-development)
    * [Remove your old app](#remove-your-old-app)
    * [Clone and install your app](#clone-and-install-your-app)
    * [Run your app](#run-your-app)
* [Instructions for platform development](#instructions-for-platform-development)
    * [Remove your old workspace directory](#remove-your-old-workspace-directory)
    * [Create your workspace](#create-your-workspace)
    * [Run your platform](#run-your-platform)
    * [Maintaining your platform](#maintaining-your-platform)
* [Instructions for platform development (manual)](#instructions-for-platform-development-manual)
    * [Remove your old source directory](#remove-your-old-source-directory)
    * [Make a new source directory](#make-a-new-source-directory)
    * [Create a workspace package.json](#create-a-workspace-packagejson)
    * [Clone stripes modules and apps](#clone-stripes-modules-and-apps)
    * [Create a platform](#create-a-platform)
    * [Create or modify your tenant config](#create-or-modify-your-tenant-config)
    * [Yarn install dependencies](#yarn-install-dependencies)
    * [Run your platform](#run-your-platform)
* [Troubleshooting](#troubleshooting)
    * [Inventory (or another module) is missing](#inventory-or-another-module-is-missing)
    * [leveldown](#leveldown)
    * [stripescli install is not idempotent](#stripescli-install-is-not-idempotent)
* [Additional information and suggestions](#additional-information-and-suggestions)
    * [Using an offline Yarn cache](#using-an-offline-yarn-cache)
    * [More about workspaces](#more-about-workspaces)
    * [Use `stripes-cli` from your workspace](#use-stripes-cli-from-your-workspace)
    * [Further reading](#further-reading)


## Introduction

There are two main approaches to FOLIO front-end development: stand-alone app development and multiple module development using a platform. This guide will walk you through both.

* App: Development of a single application can be performed entirely stand-alone.  Simply clone the repository, install dependencies, and run `yarn start`.
* Platform: Development of multiple applications or modules simultaneously, best accomplished through the use of a Yarn workspace.

_Which approach should I take?_

For developers or teams working exclusively within the scope of one or two apps (or one or two apps _at a time_), follow the simpler app development instructions.  If you find you need to occasionally loop in another app or stripes module, you can do so ad-hoc or permanently with [aliases](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#aliases).  However, developers working extensively with multiple core `stripes-*` modules and/or multiple ui-apps may find platform development to be preferable.

## Prerequisites

> TODO: Document

## Summary (TL;DR)

Make sure you are running against the most-recent version of the `testing-backend` box; yes, it's bleeding edge, but anything else is likely out of sync with the front-end modules. You must `vagrant destroy` an existing VM for `vagrant up` to find and install a new version; `vagrant halt; vagrant up` is not sufficient.

### App development summary
The following code will clone a single app repository, install dependencies, and start the development server.
```
$ git clone https://github.com/folio-org/ui-users.git
$ cd ui-users
$ yarn install
$ yarn start
```

### Platform development summary
The following code will create a new working directory named `stripes`, clone the relevant repositories into it, install their dependencies, configure the platform, and start the development server.

```
$ yarn global add @folio/stripes-cli
$ stripes workspace --modules ui-users ui-inventory stripes-sample-platform
$ cd stripes/stripes-sample-platform
$ stripes serve stripes.config.js
```

Additional commands are available to assist with maintenance of multiple repositories.
```
$ stripes platform pull
$ stripes platform clean
```


## Instructions

Review the following instructions followed by [app development](#instructions-for-app-development) or [platform development](#instructions-for-platform-development) sections as applicable.

### Update your VM

> TODO: Review these steps

Use the most-recent version of the `testing-backend` Vagrant VM to run Okapi. Other VMs, such as `stable`, are likely out of sync with the front-end modules. If you are starting from scratch, create a directory named `testing-backend` with a `Vagrantfile` inside it and then install the machine:

```
$ mkdir testing-backend
$ cd testing-backend
$ cat > Vagrantfile <<'EOF'
Vagrant.configure("2") do |config|
  config.vm.box = "folio/testing-backend"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 8192
  end
end
EOF
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


### Configure the FOLIO registry

Official releases of FOLIO modules are published to https://repository.folio.org/repository/npm-folio/. Between official releases, tip-of-master builds of each module are published to the continuous-integration registry, https://repository.folio.org/repository/npm-folioci/.  The recommended choice of registry is influenced by your development needs.

For FOLIO app developers, the `npm-folio` registry is preferred for more stable releases:
```
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folio/
```

Core `stripes-*` module developers may prefer the CI registry in order to replicate this environment when running tests and you want to alias only the repository you've made changes to and you want tip-of-master builds for everything else.
```
$ yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/
```

> Note: When present, Yarn will prefer the equivalent `npm` registry value.  Use `yarn config list` to check for any conflicts and update or clear the `npm` value if necessary: _(output abbreviated for clarity)_
```
$ yarn config list
yarn config v1.9.4
info yarn config
{ '@folio:registry': 'https://repository.folio.org/repository/npm-folio/',
}
info npm config
{ '@folio:registry': 'https://repository.folio.org/repository/npm-folio/',
}
```

### Install Stripes CLI

The [Stripes CLI](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md) facilitates many aspects of stripes front-end development.  Installing it globally [is not required](#use-stripes-cli-from-your-workspace), as our apps and platforms now include it as a devDependency, but a global install will simplify environment setup steps for new developers.

```
$ yarn global add @folio/stripes-cli
```

Or update the CLI, if you already have it:
```
$ yarn global upgrade @folio/stripes-cli
```

### Remove any aliased modules
If you previously defined any [aliases with the CLI](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#including-another-stripes-module) (for example to bring in the source for `stripes-components`), these can be reset with:
```
$ stripes alias clear
```

## Instructions for app development

> Note: This section describes standing-up an existing ui-app repository.  For instructions on creating a brand new app, please see the [app development section of the Stripes CLI User Guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#app-development) and the [Stripes Module Developer Guide](./dev-guide.md)

When developing UI apps in isolation (within your app's repo directory), starting over can be as simple as a `git reset`, `git clean`, and `yarn install`.  However, to completely start over, review the following steps using ui-users as an example:

### Remove your old app
```
$ rm -rf ui-users
```

### Clone and install your app
Using `git`, clone the your repository.  Then perform a `yarn install` from within the app's directory to install dependencies.
```
$ git clone https://github.com/folio-org/ui-users.git
$ cd ui-users
$ yarn install
```

### Run your app
With the use of the CLI, an app can be served up on its own for development in isolation. Start a development server by invoking `stripes serve` from within the app's directory.
```
$ stripes serve
```

Alternatively, use the `start` package script.  This points to `stripes serve` and will use the app's own stripes-cli devDependency.
```
$ yarn start
```

## Instructions for platform development

When working with multiple apps simultaneously, you will need a platform defined to host the apps. To work with the source code of multiple apps, we recommend using a [Yarn workspace](https://yarnpkg.com/lang/en/docs/workspaces/).  Stripes CLI automates the following steps in one command:

* Create a directory
* Create a workspace
* Clone modules
* Install dependencies
* Create a tenant configuration

### Remove your old workspace directory

First, of course, be sure that you have no uncommitted or unpushed changes. Once you have safely committed and pushed everything, you can remove the directory:

```
$ rm -rf stripes
```

> Tip: You may not need to remove your entire workspace.  Consider cleaning before starting completely over.  Refer to the `platform clean` command described in [maintaining your platform](#maintaining-your-platform) below.


### Create your workspace

Use the [`stripes workspace` command](https://github.com/folio-org/stripes-cli/blob/master/doc/commands.md#workspace-command) to create your new development environment.  This command is interactive and will prompt for the `ui-*` modules you would like to include.  **Be sure to select a platform such as `stripes-sample-platform` in addition to the apps/modules you are developing with.**  Selected modules will be git-cloned and installed automatically.

```
$ stripes workspace
? Stripes modules to include (Press <space> to select, <a> to toggle all, <i> to invert selection)
 --- UI Modules ---
❯◯ ui-users
 ◯ ui-inventory
 ◯ ui-eholdings
 ◯ ui-checkin
 ◯ ui-checkout
 ◯ ui-circulation
(Move up and down to reveal more choices)
```

> Note: Resist the urge to select everything.  It is highly recommended that you select only the modules for which you are working on.  Doing so enables dependency versions of modules you are not working on to be respected, rather than using cloned copies of everything pointing to master.

Alternatively, you may bypass the interactive step by providing a space-separated list of modules with the `--modules` option.  This is helpful when including the `workspace` command within a script.

```
$ stripes workspace --modules ui-users ui-inventory stripes-components stripes-sample-platform
```

Either approach will output progress:

```
$ stripes workspace
? Stripes modules to include ui-users, ui-inventory, stripes-components, stripes-sample-platform
  Directory "/Users/employee/projects/folio/stripes" created.

Cloning modules...
 Clone complete.

Installing dependencies...
 Directory "/Users/employee/projects/folio/stripes"
  yarn install v1.9.4
  info No lockfile found.
  [1/4] Resolving packages...
  [2/4] Fetching packages...
  [3/4] Linking dependencies...
  [4/4] Building fresh packages...
  success Saved lockfile.
  Done in 29.91s.
 Install complete.

Initializing Stripes configuration...
 Configuration complete.

Done.

Edit "stripes2/.stripesclirc.json" to modify CLI configuration including aliases for this workspace.

Platforms available: "stripes-sample-platform"
  "cd" into the above dir(s) and run "stripes serve stripes.config.js.local" to start.
  Edit "stripes.config.js.local" to turn modules on or off.

UI modules available: "ui-users", "ui-inventory"
  "cd" into the above dir(s) and run "stripes serve" to start a module in isolation.
$
```

> Tip:  You can always have more than one workspace!  Supply the `--dir` option to create a workspace with a directory other than `stripes`.  Refer to the [workspace command](https://github.com/folio-org/stripes-cli/blob/master/doc/commands.md#workspace-command) for more options.
```
$ stripes workspace --dir mydir
```

### Run your platform

At this point, the modules you selected with the workspace command will be added to your `stripes.config.js.local` configuration for any platform(s) selected.  Change to the platform directory and run the development server with:

```
$ cd stripes/stripes-sample-platform
$ stripes serve stripes.config.js.local
```

### Maintaining your platform

To pull the latest code for all cloned repositories in your platform or workspace, use `platform pull`.  When run run from within a workspace, all the available repositories will be pulled.

```
$ stripes platform pull
Pulled "/Users/employee/projects/folio/stripes2/stripes-sample-platform" { changes: 0, insertions: 0, deletions: 0 }
Pulled "/Users/employee/projects/folio/stripes2/ui-inventory" { changes: 5, insertions: 200, deletions: 99 }
Pulled "/Users/employee/projects/folio/stripes2/ui-users" { changes: 0, insertions: 0, deletions: 0 }
Done.
```

This command will warn when you have uncommited changes:
```
$ stripes platform pull
Pulled "/Users/employee/projects/folio/stripes2/stripes-sample-platform" { changes: 0, insertions: 0, deletions: 0 }
Pulled "/Users/employee/projects/folio/stripes2/ui-inventory" { changes: 0, insertions: 0, deletions: 0 }
⚠️  Not pulled "/Users/employee/projects/folio/stripes2/ui-users" Branch contains changes.
Done.
```

Sometimes, due to the vagaries of NPM and Yarn, it becomes necessary to blow away all your `node_modules` directories and start over.  This can be done using the `platform clean` command.

```
$ stripes platform clean
Cleaning 4 directories ...
Cleaned "/Users/employee/projects/folio/stripes2/stripes-sample-platform/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/ui-inventory/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/ui-users/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/node_modules
Done.
```

Optionally provide `--install` to automatically perform a yarn install afterwards.
```
$ stripes platform clean --install
Cleaning 4 directories ...
Cleaned "/Users/employee/projects/folio/stripes2/stripes-sample-platform/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/ui-inventory/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/ui-users/node_modules
Cleaned "/Users/employee/projects/folio/stripes2/node_modules
Installing dependencies ...
 Directory "/Users/employee/projects/folio/stripes2"
  yarn install v1.9.4
  [1/4] Resolving packages...
  [2/4] Fetching packages...
  [3/4] Linking dependencies...
  [4/4] Building fresh packages...
  Done in 124.03s.
Done.
```


## Instructions for platform development (manual)

The following instructions describe creating a platform by hand without the CLI. They are provided as a means to better understand the process.

### Remove your old source directory

First, of course, be sure that you have no uncommitted or unpushed changes. Once you have safely committed and pushed everything, you can remove the directory:

```
$ rm -rf stripes
```

### Make a new source directory

```
$ mkdir stripes
$ cd stripes
```

### Create a workspace package.json

A workspace is a directory with a `package.json` specifying which of the directories underneath it are to share a common `node_modules` directory.

```
$ echo "{
 \"private\": true,
 \"workspaces\": [
     \"*\"
 ],
 \"devDependencies\": {
   \"@folio/stripes-cli\": \"^1.5.0\"
 },
 \"dependencies\": {
 }
}" > package.json
```

### Clone stripes modules and apps

Clone each app or stripes module you wish to work with using `git`.

```
$ git clone https://github.com/folio-org/ui-trivial.git
Cloning into 'ui-trivial'...
remote: Enumerating objects: 72, done.
remote: Total 72 (delta 0), reused 0 (delta 0), pack-reused 72
Unpacking objects: 100% (72/72), done.
```

Repeat for each module you are currently working with, for example:
```
$ git clone https://github.com/folio-org/ui-users.git
$ git clone https://github.com/folio-org/ui-inventory.git
$ git clone https://github.com/folio-org/stripes-components.git
```

> Note: Resist the urge to clone everything.  It is highly recommended that you clone only the modules for which you are working on.  Doing so enables dependency versions of modules you are not working on to be respected, rather than using cloned copies of everything pointing to master.


### Create a platform

There are two options here.  Clone an existing platform such as `stripes-sample-platform`, or create one by hand.

Clone a platform such as `stripes-sample-platform`:
```
$ git clone https://github.com/folio-org/stripes-sample-platform.git
Cloning into 'stripes-sample-platform'...
remote: Enumerating objects: 4, done.
remote: Counting objects: 100% (4/4), done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 379 (delta 1), reused 0 (delta 0), pack-reused 375
Receiving objects: 100% (379/379), 116.96 KiB | 1.86 MiB/s, done.
Resolving deltas: 100% (211/211), done.
```

Alternatively, create a platform by hand. Be sure to include the [`stripes` framework as a dependency](https://github.com/folio-org/stripes/blob/master/doc/stripes-framework.md#usage).

```
$ mkdir my-platform
$ cd my-platform
$ echo "{
  \"dependencies\": {
    \"@folio/inventory\": \"^1.4.0\",
    \"@folio/stripes\": \"^1.0.0\",
    \"@folio/trivial\": \"^1.2.0\",
    \"@folio/users\": \"^2.17.0\",
    \"react\": \"^16.3.0\"
  },
  \"devDependencies\": {
    \"@folio/stripes-cli\": \"^1.5.0\"
  }
}" > package.json
```

### Create or modify your tenant config

In `stripes-sample-platform` (or whatever platform directory of your own you prefer to use), make a `stripes.config.js` file, or taking priority over that if present a `stripes.config.js.local`. (The simplest way to make the latter file is to copy the former from `stripes-sample-platform`, and edit it as required.)

Include the modules that you have elected to clone and update the Okapi URL and tenant ID to match your backend system.

```
$ echo "module.exports = {
  okapi: {
    url:'http://localhost:9130',
    tenant:'diku'
  },
  config: {
  },
  modules: {
    '@folio/trivial': {},
    '@folio/users': {},
    '@folio/inventory': {}
  },
};" > stripes.config.js
```

### Yarn install dependencies

Install your dependencies from the workspace root.  Given you were in the platform directory on the prior step, you will need to go up a directory.

```
$ cd ..
$ yarn install
```

### Run your platform

From within the platform directory, can serve your development copy of Stripes using the CLI:

```
$ cd stripes-sample-platform
$ stripes serve stripes.config.js
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

## Additional information and suggestions

### Using an offline Yarn cache

Yarn tends to rebuild native binaries rather more often that it really needs to. Since this can take some time, Yarn v1.5.1 has added a new feature to cache the build artifacts. In order to take advantage of it, you'll need to enable the offline cache generally for which you'll need to make a directory (`/some/path/yarn-offline-cache` below, but can be anything). The relevant `.yarnrc` settings are:
```
experimental-pack-script-packages-in-mirror true
pack-built-packages true
yarn-offline-mirror "/some/path/yarn-offline-cache"
```

### More about workspaces

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

Since `stripes-cli` makes use of `stripes-core` and `stripes-testing`, some prefer to install it in a workspace rather than globally so that it sees local changes to those packages and doesn't need to bring in a bunch of duplicate copies of the dependency tree. To that end one can alias the `stripes` command in `~/.bash_aliases` (for shells other than Bash, it'll be similar yet different):
```
alias stripes='node /path/to/my/workspace/node_modules/.bin/stripes $*'
```

### Further reading

Additional information can be found in the Stripes CLI [User Guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md). This includes an overview on using the CLI to [interact with Okapi](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#interacting-with-okapi), [create UI permissions](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#managing-ui-permissions), and [generate a production build](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#generating-a-production-build).

Review the [Stripes Module Developer Guide](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md) and [Stripes Components README](https://github.com/folio-org/stripes-components/blob/master/README.md) for information on developing your apps.

The stripes-cli [command reference](https://github.com/folio-org/stripes-cli/blob/master/doc/commands.md) includes additional options for all commands used above.  You can also obtain the same information at your terminal with the `--help` option for any command.
```
$ stripes workspace --help
```
