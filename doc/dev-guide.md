# The Stripes Module Developer's Guide

<!-- ../../okapi/doc/md2toc -l 2 dev-guide.md -->
* [Status](#status)
* [Scope](#scope)
* [Specifying dependencies](#specifying-dependencies)
* [Styling](#styling)


## Status

This document is in progress and incomplete. In time, it will  an introduction and overview, and form a coherent narratvie. For the moment, it's just a holding place for information that needs to be in the documentation somewhere, but does not yet have an obvious home.


## Scope

This document is aimed at those writing application modules for Stripes -- such as the Users module, the Items module and the Scan module. Those working on the packages that make up Stripes itself (such as stripes-connect and stripes-components) mus follow rather different conventions.


## Specifying dependencies

In general, we expect every module to pass [ESLint](http://eslint.org/) with no errors. This means, among other things, that every package that a module uses must be listed as a dependency in its `package.json`. Modules may not blindly rely on the provision of facilities such as React and Redux via Stripes Core, but must specify for themselves what they use, and what version they require.

Specifically:

* Every package that a module imports (`react`, `react-router`, `stripes-components`, etc.) should be declared as a dependency in `package.json` -- most easily added using `yarn add` _packageName_.

* When `stripes-connect` is used -- even when it's not imported, but the curried `connect` function from the props of the top-level component is used -- it should be declared as a peer-dependency. (This is essentially specifying what version of the stripes-connect API we are relying on).


## Styling

In general, modules should not use CSS directly, nor rely on styling libraries such as Bootstrap, but should use low-lever components from `stripes-components`, which are pre-styled according to Stripes conventions.


