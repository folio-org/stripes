# The Stripes Module Developer's Guide

<!-- ../../okapi/doc/md2toc -l 2 dev-guide.md -->
* [Status and Scope](#status-and-scope)
* [Code quality](#code-quality)
* [Specifying dependencies](#specifying-dependencies)
* [The Stripes object](#the-stripes-object)
* [Enforcing permissions](#enforcing-permissions)
    * [The permissions structure](#the-permissions-structure)
    * [Testing for permission](#testing-for-permission)
* [Logging](#logging)
    * [Configuring the logger](#configuring-the-logger)
    * [Using the logger](#using-the-logger)
* [Styling HTML](#styling-html)


## Status and Scope

**This document is in progress and incomplete.** In time, it will be an introduction and overview, and form a coherent narrative. For the moment, it's just a holding place for information that needs to be in the documentation somewhere, but does not yet have an obvious home.

This document is aimed at those writing application modules for Stripes -- such as the Users module, the Items module and the Scan module. Those working on the packages that make up Stripes itself (such as `stripes-connect` and `stripes-components`) must follow rather different conventions.


## Code quality

In general, we expect every module to pass [ESLint](http://eslint.org/) with no errors.

We aim to write tests (generally using [Mocha](https://mochajs.org/), though at present we are not as far along with this as we might wish. Over time, we will develop conventions for how best to mock parts of FOLIO for testing purposes.

If you are not sure about some code you have written, ask for a code review from another member of the team. We do _not_, as a matter of course, review all code: our judgement at present is that doing so would cost us more than it bought us.


## Specifying dependencies

ESLint cleanliness means, among other things, that every package that a module uses must be listed as a dependency in its `package.json`. Modules may not blindly rely on the provision of facilities such as React and Redux via Stripes Core, but must specify for themselves what they use, and what version they require.

Specifically:

* Every package that a module imports (`react`, `react-router`, `stripes-components`, etc.) should be declared as a dependency in `package.json` -- most easily added using `yarn add` _packageName_.

* When `stripes-connect` is used -- even when it's not imported, but the curried `connect` function from the props of the top-level component is used -- it should be declared as a peer-dependency. (This is essentially specifying what version of the stripes-connect API we are relying on).


## The Stripes object

Programming in Stripes is essentially [programming in React](https://facebook.github.io/react/docs/thinking-in-react.html), with one big difference: the provision of the Stripes object. As with regular React, data flows down through components (as props) and actions flow up.

The Stripes object is provided as the `stripes` property to the top-level component of each module (and to its settings component, if it has one). It is the responsibility of that component to make it available as required elsewhere in the module -- by passing the prop down to its children, by installing it in the React context, or by some other means.

The Stripes object contains the following elements:

* `connect` -- a function that can be used to connect subcomponents to [stripes-connect](https://github.com/folio-org/stripes-connect), enabling that module to use [the Stripes Connect API](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md) to communicate with WSAPIs such as those provided by Okapi.

* `hasPerm` -- a function that can be used for [checking whether the presently logged-in user has a specified permission](#testing-for-permission).

* `logger` -- a [stripes-logger](https://github.com/folio-org/stripes-logger) object that has been configured for Stripes and can be used in the usual way: see [Logging](#logging).

* `store` -- the application's [Redux](https://github.com/reactjs/redux) store. **In general, you should not use this**, relying instead on the Stripes Connect facilities; but it is provided as a backdoor which developers can use with discretion.

* `okapi` -- a structure containing configuration information about the connection of Okapi:

  * `url` -- the base URL used in communication with Okapi. **In general, you should not use this** but there may be times when it is necessary to make an out-of-band call using [`fetch`](https://github.com/matthew-andrews/isomorphic-fetch) rather then have Stripes Connect handle communication.

  * `tenant` -- the unique ID of the FOLIO tenant that is being accessed.

* `user` -- a structure containing configuration information about the presently logged-in user:

  * `perms` -- the set of permissions associated with the logged-in user, as described [below](#the-permissions-structure).

  * `user` --- an object containing metadata about the logged-in user, with felds such as `email`, `first_name`, and `last_name`.

* `config` -- a structure containing misleading configuration information, including:

  * `disableAuth` -- whether authentication is disabled. **NOTE.** This is deprecated. Support for it will probably be removed, since an unauthenticated session is increasingly useless.

  * `logCategories`, `logPrefix`, `logTimestamp` -- see [Configuring the logger](#configuring-the-logger) below.

  * `showPerms` -- a boolean indicating whether the user menu at top right should display a list of the logged-in user's permissions. This is useful in development, but distracting in production.


## Enforcing permissions

Users in the FOLIO system have a set of permissions assigned to them. These are named by short strings such as `users.read`, `users.edit`, `perms.permissions.create`, etc. Operations are allowed or prohibited by server-side modules according as the logged-in user does or does not have the corresponding permissions.

However, in order to prevent misleading the user, or provoking inevitable authorization errors, good UI code also checks the available permissions, and does not provide the option of attempting operations that are doomed to fail. It does this by consulting the user's list of permissions and checking to see whether they include the one necessary for the operation in question.

### The permissions structure

The permissions are provided to the top-level component of each module as the `users.perms` element of the `stripes` property; it is the responsibility of that component to make the `stripes` object available to other components -- either by passing it as a property (`<SubComponent ... stripes={this.props.stripes}>` or by installing it in the React context.

The `perms` structure is a JavaScript object whose keys are the names of the permissions that the user has, and whose keys are the corresponding human-readable descriptions. For example, the `users.read` permission might have the descriptions "Can search users and view brief profiles".

### Testing for permission

Generally, code should not assume that the `user.perms` element of the `stripes` component exists, since the initial render of some components may happen before a user has logged in. So a permission such as `this.props.stripes.user.perms['users.read']` should be checked only after the existence of the permissions structure has been verified. The easiest way to do this is using the `stripes` object's `hasPerm` method:

```
if (this.props.stripes.hasPerm('users.read')) ...
```

When guarding small elements, such as an "New user" button that should appear only when when the `users.create` permission is present, the helper component [`<IfPermission>`](https://github.com/folio-org/stripes-components/blob/master/lib/IfPermission/readme.md) can be used:

```
<IfPermission {...this.props} perm="users.create">
  <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
</IfPermission>
```


## Logging

Logging in Stripes is done using [stripes-logger](https://github.com/folio-org/stripes-logger), a simple generalisation of `console.log` where each message is assigned to a category, and the developer can decide at run-time which categories should be emitted and which ignored. In this way, it's possible to see (for example) only logging of how stripes-connect paths are resolved.

### Configuring the logger

The `config` section of the Stripes configuration file -- usually called `stripes.config.js` or similar -- can be used to configure logging. The three relevant settings are:

* `logCategories`: a comma-separated list of categories to include: for example, `'core,action,path'`. If this is not specified, the default is to log the single category `redux`. (See below for existing categories.)
* `logPrefix`: a string which, if defined, is included at the start of all log messages. This can be explicitly set to `undefined`, but defaults to `'stripes'`.
* `logTimestamp`: a boolean which, if true, results in an ISO-format timestamp being emitted at the start of each logged message (after the logPrefix, if any). Defaults to false.

The stripes-core library lets you make up categories on the fly -- so, for example, a Circulation module might use the category `'circ'`. But some categories are in use by Stripes itself, and can usefully be included in the logCategories setting. These include:

* `core` -- messages emitted by stripes-core itself.
* `redux` -- messages generated by the `redux-logger` library, describing Redux actions.
* `path` -- messages generated by stripes-connect describing how paths are generated by string substitution and fallback.
* `mpath` -- conventionally used by application modules to log path generations by path functions.
* `action` -- conventionally used by application modules to log user actions such as searching, sorting and editing.
* `perm` -- emits a message whenever a permission is checked, whether successfully or not.
* `xhr` -- conventionally used by application modules if for some reason they have to execute their own XML HTTP Request (or more often, these days, JSON HTTP Request). Note that in general, **modules should not do this** but should use the facilities provided by stripes-core.

### Using the logger

The configured logger object is furnished as the `logger` element of the `stripes` property to the top-level component of each UI module. It is the responsibility of that component to ensure it is passed down to any subcomponents that need to use it. Logging can therefore be invoked using `this.props.stripes.logger.log('cat', args)`.

In addition, the logger is passed as the fourth argument into stripes-connect path functions.


## Styling HTML

In general, modules should not use CSS directly, nor rely on styling libraries such as Bootstrap, but should use low-lever components from `stripes-components`, which are pre-styled according to Stripes conventions.


