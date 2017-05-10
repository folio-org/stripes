# The Stripes Module Developer's Guide

<!-- ../../okapi/doc/md2toc -l 2 dev-guide.md -->
* [Status and Scope](#status-and-scope)
* [Introduction](#introduction)
    * [How Stripes fits together](#how-stripes-fits-together)
    * [Underlying technology](#underlying-technology)
    * [Modules](#modules)
        * [Skeleton module](#skeleton-module)
    * [Code quality](#code-quality)
        * [ESLint](#eslint)
        * [Use of the JavaScript console.](#use-of-the-javascript-console)
        * [Unit-testing](#unit-testing)
        * [Code-review](#code-review)
    * [Specifying dependencies](#specifying-dependencies)
* [Development](#development)
    * [The Stripes object](#the-stripes-object)
    * [Connecting a component](#connecting-a-component)
    * [Enforcing permissions](#enforcing-permissions)
        * [The permissions structure](#the-permissions-structure)
        * [Testing for permission](#testing-for-permission)
    * [Logging](#logging)
        * [Configuring the logger](#configuring-the-logger)
        * [Using the logger](#using-the-logger)
    * [Styling HTML](#styling-html)
* [Thinking in Stripes](#thinking-in-stripes)
    * [Principles of stripes-connect](#principles-of-stripes-connect)
    * [Declarative, immutable data manifest](#declarative-immutable-data-manifest)
    * [Modifiable local state](#modifiable-local-state)
    * [Firing actions](#firing-actions)
* [Component structure in Stripes UI modules](#component-structure-in-stripes-ui-modules)
* [Appendix: escaping to redux](#appendix-escaping-to-redux)
* [Other (XXX to be integrated)](#other-xxx-to-be-integrated)




## Status and Scope

**This document is in progress.** We endeavour to ensure that all the information here is correct, but we make no promises that is complete. (In this respect, it resembles a formal system of number theory.)

This document is aimed at those writing UI modules for Stripes -- such as the Users module, the Items module and the Scan module. Those working on the packages that make up Stripes itself (such as `stripes-connect` and `stripes-components`) must follow rather different conventions.




## Introduction

The Stripes toolkit aims to make it as easy as possible to write UI modules that communicate with RESTful Web services. Most importantly, it is the toolkit used to write UI modules for [the FOLIO library services platform](https://www.folio.org/).

This document aims to bring new UI module developers up to speed with the concepts behind Stripes (especially stripes-connect), so that they are have a context in which to understand [The Stripes Connect API](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md) reference guide.



### How Stripes fits together

Stripes consists of several separate JavaScript libraries that work together. The good news is that you don't need to think about most of them in order to create Stripes-based UI modules. They are:

* [**stripes-connect**](https://github.com/folio-org/stripes-connect) -- provides the connection to FOLIO's services.
* [**stripes-components**](https://github.com/folio-org/stripes-components) -- provides re-usable UI components such as checkboxes, search forms and multi-pane layouts.
* [**stripes-loader**](https://github.com/folio-org/stripes-loader) -- low-level machinery that pulls a set of Stripes Modules into a web application.
* [**stripes-logger**](https://github.com/folio-org/stripes-logger) -- simple facilities logging. 
* [**stripes-core**](https://github.com/folio-org/stripes-core) -- a web application that controls a set of UI modules and helps them to work together.

In general, stripes-core is configured by a list of UI modules to include, and it uses stripes-loader to pull them all into a 
bundle of HTML/CSS/JS resources. Each of those modules composes UI elements from stripes-components (and other sources as needed), and these use stripes-connect to search, view, edit and manage data maintained by the FOLIO web-services, logging information with stripes-logger as desired.



### Underlying technology

Stripes UI modules are written in **JavaScript** -- specifically, in [ECMAScript 6 (ES6)](http://es6-features.org/), a modern version of JavaScript that fixes many of the problems that made the earlier version of the language difficult to work with.

The Stripes UI is built using [**React**](https://facebook.github.io/react/), a library that provides an elegant component-based approach that can provide a very responsive user experience. The promise of React is that it "will efficiently update and render just the right components when your data changes." And the goal of stripes-connect is to ensure that your a module's React components are given the right data.

React works best when used with [**JSX**](https://jsx.github.io/), a simple syntax for embedding XML (including HTML) into JavaScript. You don't need to use JSX,  but it's easy to learn and very expressive.

As a module author, you need to know JavaScript (specifically ES6), React and ideally JSX; and be familiar with UI components (including those available from stripes-components) and understand how to connect to FOLIO web-services.

(Under the hood, stripes-connect uses [Redux](https://github.com/reactjs/redux) to manage its state. But UI module authors should not need to use Redux directly. See [the appendix](#appendix-escaping-to-redux) if for some reason you do need access to the underlying Redux store.)



### Modules

The unit of UI development is the _module_. A Stripes UI module is a self-contained chunk of UI that can be loaded into Stripes, and which therefore must conform to various requirements. The source-code for a module is generally held in a git project whose name begins `ui-`.

A module is presented as an [NPM package](https://en.wikipedia.org/wiki/Npm_(software)). In addition to [the usual information in its `package.json`](https://docs.npmjs.com/files/package.json), a Stripes module must provide a `stripes` entry containing the following information:

* `type` -- a short string indicating what the type of the module is, and how it therefore behaves within the Stripes application. Acceptable values are:
  * `app` -- a regular application, which is listed among those available and which when activated uses essentially the whole screen.
  * `settings` -- a settings pane that is listed in the settings menu but does not present a full-page application.

* `displayName` -- the name of the module as it should be viewed by human users -- e.g. "Okapi Console".

* `route` -- the route (partial URL) by which an application module is addressed: for example, the Okapi Console module might be addressed at `/console`. The same route is used as a subroute within `/settings` to present the module's settings, if any.

* `home` -- the first page of the module that should be presented to users, if this is different from the `route`. (It may be different because of default options being selected: for example, the Users module might be set up so that by default it limits its user-list to active users: this could be expressed with a `home` setting of `/users?filters=active.Active`.)

* `hasSettings` -- for "app" modules, if this is true then a settings pane is also provided, and a link will be listed in the Settings area. If this is false (the default) no settings are shown for the module. This is ignored for "settings" modules.

When a user enters an application module, its top-level component -- usually `index.js` is executed, and whatever it exports is invoked as a React component. When a user enters a settings module or the settings of an application module, that same component is invoked, but now with the special `showSettings` property set true.


#### Skeleton module

In its early stages, the Organization module, [`ui-organization`](https://github.com/folio-org/ui-organization), provided a good example of what is required. If you are looking for a template on which to base your own module, [commit 98cdfee0](https://github.com/folio-org/ui-organization/tree/98cdfee0fab4f74b9dc3e412b81a433121de5631) is a good place to start.



### Code quality


#### ESLint

In general, we expect every module to pass [ESLint](http://eslint.org/) without errors. (Run `yarn lint` in the project directory to check: new modules should be set up so that this works.) This does not necessarily mean that you must slavishly obey every order of ESLint: you may judge that one of its rules is foolish, and configure it not to apply -- for example, sometimes [`no-nested-ternary`](http://eslint.org/docs/rules/no-nested-ternary) impedes the most natural way to express an idea. But use [`eslint-disable` comments](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments) judiciously, only after carefully considering whether the code really could be rewritten in a clearer way.


#### Use of the JavaScript console.

All module code should run without leaving warnings in the JavaScript console. If you find a warning, hunt it down and fix it. Some warnings, especially from React, presage very bad and unpredictable things.

In checked-in code, modules should not emit console message using `console.log` and similar -- although it can be useful to add such lines on a temporary basis during development. ESLint will help you find any stray logging commands. All console output should be generated using stripes-logger, as described [below](#logging).


#### Unit-testing

We aim to write unit tests (generally using [Mocha](https://mochajs.org/), though at present we are not as far along with this as we might wish. Over time, we will develop conventions for how best to mock parts of FOLIO for testing purposes.


#### Code-review

If you are not sure about some code you have written, ask for a code review from another member of the team. We do _not_, as a matter of course, review all code: our judgement at present is that doing so would cost us more than it bought us.



### Specifying dependencies

ESLint cleanliness means, among other things, that every package that a module uses must be listed as a dependency in its `package.json`. Modules may not blindly rely on the provision of facilities such as React and Redux via Stripes Core, but must specify for themselves what they use, and what version they require.

Specifically:

* Every package that a module imports (`react`, `react-router`, `stripes-components`, etc.) should be declared as a dependency in `package.json` -- most easily added using `yarn add` _packageName_.

* When `stripes-connect` is used -- even when it's not imported, but the curried `connect` function from the props of the top-level component is used -- it should be declared as a peer-dependency. (This is essentially specifying what version of the stripes-connect API we are relying on).




## Development



### The Stripes object

Programming in Stripes is essentially [programming in React](https://facebook.github.io/react/docs/thinking-in-react.html), with one big difference: the provision of the Stripes object. As with regular React, data flows down through components (as props) and actions flow up.

The Stripes object is provided as the `stripes` property to the top-level component of each module. It is the responsibility of that component to make it available as required elsewhere in the module -- by passing the prop down to its children, by installing it in the React context, or by some other means.

The Stripes object contains the following elements:

* `locale` -- a short string specifying the prevailing locale, e.g. `en-US`. This should be consulted when rendering dates with `toLocaleDateString`, etc.

* `connect` -- a function that can be used to connect subcomponents to [stripes-connect](https://github.com/folio-org/stripes-connect), enabling that module to use [the Stripes Connect API](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md) to communicate with WSAPIs such as those provided by Okapi.

* `hasPerm` -- a function that can be used for [checking whether the presently logged-in user has a specified permission](#testing-for-permission).

* `logger` -- a [stripes-logger](https://github.com/folio-org/stripes-logger) object that has been configured for Stripes and can be used in the usual way: see [Logging](#logging).

* `store` -- the application's [Redux](https://github.com/reactjs/redux) store. **In general, you should not use this**, relying instead on the Stripes Connect facilities; but it is provided as a backdoor which developers can use with discretion. See [the Appendix](#appendix-escaping-to-redux).

* `okapi` -- a structure containing configuration information about the connection of Okapi:

  * `url` -- the base URL used in communication with Okapi. **In general, you should not use this** but there may be times when it is necessary to make an out-of-band call using [`fetch`](https://github.com/matthew-andrews/isomorphic-fetch) rather then have Stripes Connect handle communication.

  * `tenant` -- the unique ID of the FOLIO tenant that is being accessed.

* `user` -- a structure containing configuration information about the presently logged-in user:

  * `perms` -- the set of permissions associated with the logged-in user, as described [below](#the-permissions-structure).

  * `user` -- an object containing metadata about the logged-in user, with fields such as `email`, `first_name`, and `last_name`.

* `config` -- a structure containing misleading configuration information, including:

  * `logCategories`, `logPrefix`, `logTimestamp` -- see [Configuring the logger](#configuring-the-logger) below.

  * `showPerms` -- a boolean indicating whether the user menu at top right should display a list of the logged-in user's permissions. This is useful in development, but distracting in production.

  * `hasAllPerms` -- a boolean indicating whether to assume that the user has all permissions. Obviously this should usually be false (the default); setting it to true can be useful in development, but does not grant any real escalation in privilege, since server-side permission checks cannot be bypassed.



### Connecting a component

The top-level component of each module is automatically connected, so that it can use the stripes-connect facilities. However, components included within this top-level one, whether directly or indirectly, must be connected using the curried-connect function provided in the Stripes object.

Because connecting is a non-trivial operation, it is best to do this once in the constructor of the containing component rather than inline in its `render` method where it will be activated many times. The standard idiom is:

```
import Child from './Child';

class Parent extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    this.connectedChild = props.stripes.connect(Child);
  }

  render(props) {
    return <div><Stuff /><connectedChild props={...props} /></div>;
  }
}

export default Parent;

```



### Enforcing permissions

Users in the FOLIO system have a set of permissions assigned to them. These are named by short strings such as `users.read`, `users.edit`, `perms.permissions.create`, etc. Operations are allowed or prohibited by server-side modules according as the logged-in user does or does not have the corresponding permissions.

However, in order to prevent misleading the user, or provoking inevitable authorization errors, good UI code also checks the available permissions, and does not provide the option of attempting operations that are doomed to fail. It does this by consulting the user's list of permissions and checking to see whether they include the one necessary for the operation in question.


#### The permissions structure

The permissions are provided to the top-level component of each module as the `users.perms` element of the `stripes` property; it is the responsibility of that component to make the `stripes` object available to other components -- either by passing it as a property (`<SubComponent ... stripes={this.props.stripes}>` or by installing it in the React context.

The `perms` structure is a JavaScript object whose keys are the names of the permissions that the user has, and whose keys are the corresponding human-readable descriptions. For example, the `users.read` permission might have the descriptions "Can search users and view brief profiles".


#### Testing for permission

Generally, code should not assume that the `user.perms` element of the `stripes` component exists, since the initial render of some components may happen before a user has logged in. So a permission such as `this.props.stripes.user.perms['users.read']` should be checked only after the existence of the permissions structure has been verified. The easiest way to do this is using the `stripes` object's `hasPerm` method:

```
if (this.props.stripes.hasPerm('users.read')) ...
```

When guarding small elements, such as a "New user" button that should appear only when when the `users.create` permission is present, the helper component [`<IfPermission>`](https://github.com/folio-org/stripes-components/blob/master/lib/IfPermission/readme.md) can be used:

```
<IfPermission {...this.props} perm="users.create">
  <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
</IfPermission>
```



### Logging

Logging in Stripes is done using [stripes-logger](https://github.com/folio-org/stripes-logger), a simple generalisation of `console.log` where each message is assigned to a category, and the developer can decide at run-time which categories should be emitted and which ignored. In this way, it's possible to see (for example) only logging of how stripes-connect paths are resolved.


#### Configuring the logger

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


#### Using the logger

The configured logger object is furnished as the `logger` element of the `stripes` property to the top-level component of each UI module. It is the responsibility of that component to ensure it is passed down to any subcomponents that need to use it. Logging can therefore be invoked using `this.props.stripes.logger.log('cat', args)`.

In addition, the logger is passed as the fourth argument into stripes-connect path functions.



### Styling HTML

In general, modules should not use CSS directly, nor rely on styling libraries such as Bootstrap, but should use low-lever components from `stripes-components`, which are pre-styled according to Stripes conventions.




## Thinking in Stripes



### Principles of stripes-connect

When programming with stripes-connect, you do not directly interact with the back-end web-services. There is no sending of requests or handling of responses -- the stripes-connect library deals with all that. Instead, UI components do three things:

1. They make a declarative statement of what back-end information they are interested, in the form of a _manifest_. The manifest provides information about a number of _resources_, each of which corresponds to data available from the back-end. Most importantly, each resource's `path` specifies how various parts of state -- URL path components and query parameters, local state such as form values, etc. -- is composed into a web-service URL used to access the back-end web-service. XXX note that other parameters, such as `query`, now also come into play. Update needed here.

3. They access this information via the `data` property that is passed into the component -- `this.props.data.NAME` for the data associated with the resource called _NAME_.

3. They modify local state, through the use of _mutators_, to reflect users' actions, such as searching, sorting, selecting and editing records.

That is all. The stripes-connect library issues the necessary requests, handles the responses, and updates the component's properties; and React then ensures that components whose contents have changed are re-rendered.



### Declarative, immutable data manifest

A manifest is provided by each connected component class in a UI module. It is a class-level static constant. For example:

	static manifest = Object.freeze({
	  user: {
	    type: 'okapi',
	    path: 'users/:{userid}',
	  },
	});

(This manifest declares a single resource, called `user`, which is connected to an Okapi service at a path that depends on the `userid` part of the path in the UI's URL.)

The manifest is constant, immutable, and identical across all instances of a class -- something that is conventionally indicated in code by freezing the object with `Object.freeze()`. It can be thought of as constituting a set of instructions for transforming local state into remote operations.



### Modifiable local state

The manifest is immutable, and shared between all instances of a component. By contrast, each instance of a component has its own local state, and may change it at any time.

State is of several kinds:

* React state, which may be modified at any time using React's standard `setState()` method. This is typically how components keep track of UI elements such as query textboxes and filtering checkboxes -- see the React documentation on [Forms and Controlled Components](https://facebook.github.io/react/docs/forms.html).

* Stripes-connect resources of type `local` (as opposed to `rest` or `okapi`). Changing these does not cause a change on a remote resource, only locally. They differ from the React state in that they are persistent across renderings of the same component: for example, is a UI module's search-term is held in a local resource rather than in React state, it will still be there on returning to that module from another one within the same Stripes application.

* The present URL of the UI application, which typically carries state in both its path and its query: for example, the URL `/users/123?query=smith&sort=username` contains a user-ID `123` in its path, and a query `smith` and sort-specification `username` in query parameters `query` and `sort` respectively.

  (At present, the URL is changed using the standard React Router method, `this.props.history.push(newUrl)`, or more often the stripes-components utility function `transitionToParams`. In future, this will probably done instead using mutators -- concerning which, see below.)

Stripes-connect detects changes to the state, and issues whatever requests are necessary to obtain relevant data. For example, if the URL changes from `/users/123?query=smith&sort=username` to `/users/123?query=smith&sort=email`, it will issue a new search request with the sort-order modified accordingly.



### Firing actions

Every connected component is given a property called `mutator`. This is an object whose keys are the names of the resources specified in the manifest, and whose values are objects containing functions that can act upon those resources. These fucntions each taking a single argument that is an object of _key_:_value_ pairs.

For local resources, there are two functions in the mutator:

* `replace`: replaces the resources current set of values with the new set.
* `update`: merges the new set of values into the old.

For remote resource (of type `rest` and `okpai`) there are three functions, named after the HTTP methods:

* `POST`: creates a new record on the remote service.
* `PUT`: updates an existing record on the remote service.
* `DELETE`: deletes an old record on the remote services.

For these mutator functions, the argument represents a record being CRUDded to the service. Note that by design _there is no GET mutator_: applications should never need to fetch their own data, but always get it implicitly, passed into props.




## Component structure in Stripes UI modules

At least two "styles" are possible when designing the set of components that will make up a Stripes UI modules. It's possible to build modules where one big component does most or all of the stripes-connecting, and drives many much simpler unconnected subcomponents; or a module may consist of many small components that are each stripes-connected to obtain the data they display. Which is better?

The Redux community leans towards fewer connected components where possible, as components that are purely functions of their props are easiest to debug, test and maintain. This is a good rule of thumb for stripes-connected components, too: aim for fewer connected components except where doing that means going more than a little bit out of the way and creating convoluted code.

XXX but note the implications when avoid permission errors from WSAPIs.




## Appendix: escaping to Redux

**WARNING.** Do not do this.

In general, Stripes modules should never need to access the Redux store that is used internally. However, in some unusual circumstances, this may be necessary. For example, then the Users module creates a new user, it then goes on to post the user's credentials (username and password) to a different WSAPI endpoint and the user's initial set of permissions to a third endpoint. Rather then using stripes-connect for these operations, it uses low-level [`fetch`](https://github.com/matthew-andrews/isomorphic-fetch) calls; and in order to obtain the current session's authentication token to include in the HTTP calls, it looks inside the state of the Redux store.

This store is available as `store` on the Stripes object, and its state is available via the `getState` method. So:

```
class Users extends React.Component {
  static contextTypes = {
    store: PropTypes.object,
  };

  postCreds(username, creds) {
    const okapi = context.store.getState().okapi;
    fetch(url, {
      method: 'POST',
      headers: Object.assign({}, {
        'X-Okapi-Tenant': okapi.tenant,
        'X-Okapi-Token': okapi.token,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(creds),
    });
  }
}
```

Note that this code does _not_ access the stripes-connect data within the Redux store: so far, no situation has been found where thar is necessary or desirable. Instead, it accesses internal data about the present session. (Arguably, that data should be made available in the Stripes object; but really, module code should not need to use this at all.)




## Other (XXX to be integrated)

Beware of re-using resource names in multiple components within a single module.

