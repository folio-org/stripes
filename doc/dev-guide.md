# The Stripes Module Developer's Guide

<!-- md2toc -l 2 dev-guide.md -->
* [Status and Scope](#status-and-scope)
* [Introduction](#introduction)
    * [How Stripes fits together](#how-stripes-fits-together)
    * [Underlying technology](#underlying-technology)
    * [Modules](#modules)
        * [The package-file `stripes` entry](#the-package-file-stripes-entry)
        * [Skeleton module](#skeleton-module)
    * [Code quality](#code-quality)
        * [ESLint](#eslint)
        * [Use of the JavaScript console.](#use-of-the-javascript-console)
        * [Unit-testing](#unit-testing)
        * [Code-review](#code-review)
    * [Specifying dependencies](#specifying-dependencies)
* [Guidelines for structuring your Stripes module](#guidelines-for-structuring-your-stripes-module)
* [Development](#development)
    * [The Stripes object](#the-stripes-object)
    * [Connecting a component](#connecting-a-component)
        * [Specifying parameters, including limits](#specifying-parameters-including-limits)
    * [URL navigation](#url-navigation)
    * [Enforcing permissions](#enforcing-permissions)
        * [The permissions structure](#the-permissions-structure)
        * [Testing for permission](#testing-for-permission)
    * [Checking interfaces](#checking-interfaces)
        * [The discovery structure](#the-discovery-structure)
        * [Testing for interfaces](#testing-for-interfaces)
    * [Enabling hot-keys](#enabling-hot-keys)
    * [Logging](#logging)
        * [Configuring the logger](#configuring-the-logger)
        * [Using the logger](#using-the-logger)
        * [Redux-DevTools-Extension](#redux-devtools-extension)
    * [Plugins](#plugins)
    * [Handlers and events](#handlers-and-events)
    * [Links](#links)
    * [Internationalization](#internationalization)
        * [Creating module translations](#creating-module-translations)
        * [Using module translations](#using-module-translations)
        * [Using core translations](#using-core-translations)
        * [Translating permission names](#translating-permission-names)
        * [Filtering translations at build time](#filtering-translations-at-build-time)
        * [Other uses of the locale](#other-uses-of-the-locale)
    * [Styling HTML](#styling-html)
    * [Network tab in Google Chrome](#network-tab-in-google-chrome)
* [Thinking in Stripes](#thinking-in-stripes)
    * [Principles of stripes-connect](#principles-of-stripes-connect)
    * [Declarative, immutable data manifest](#declarative-immutable-data-manifest)
        * [Note on sharing resources between components](#note-on-sharing-resources-between-components)
    * [Modifiable local state](#modifiable-local-state)
    * [Firing actions](#firing-actions)
* [Appendix A: Escaping to Redux](#appendix-a-escaping-to-redux)
* [Appendix B: Mandatory back-end services for stripes-core](#appendix-b-mandatory-back-end-services-for-stripes-core)




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
* [**stripes-logger**](https://github.com/folio-org/stripes-logger) -- simple facilities logging.
* [**stripes-core**](https://github.com/folio-org/stripes-core) -- a web application that controls a set of UI modules and helps them to work together.

In general, stripes-core is configured by a list of UI modules to include, and it uses a webpack plugin to pull them all into a
bundle of HTML/CSS/JS resources. Each of those modules composes UI elements from stripes-components (and other sources as needed), and these use stripes-connect to search, view, edit and manage data maintained by the FOLIO web-services, logging information with stripes-logger as desired.



### Underlying technology

Stripes UI modules are written in **JavaScript** -- specifically, in [ECMAScript 6 (ES6)](http://es6-features.org/), a modern version of JavaScript that fixes many of the problems that made the earlier version of the language difficult to work with.

The Stripes UI is built using [**React**](https://facebook.github.io/react/), a library that provides an elegant component-based approach that can provide a very responsive user experience. The promise of React is that it "will efficiently update and render just the right components when your data changes." And the goal of stripes-connect is to ensure that a module's React components are given the right data.

React works best when used with [**JSX**](https://jsx.github.io/), a simple syntax for embedding XML (including HTML) into JavaScript. You don't need to use JSX,  but it's easy to learn and very expressive.

As a module author, you need to know JavaScript (specifically ES6), React and ideally JSX; and be familiar with UI components (including those available from stripes-components) and understand how to connect to FOLIO web-services.

(Under the hood, stripes-connect uses [Redux](https://github.com/reactjs/redux) to manage its state. But UI module authors should not need to use Redux directly. See [Appendix A](#appendix-a-escaping-to-redux) if for some reason you do need access to the underlying Redux store.)



### Modules

The unit of UI development is the _module_. A Stripes UI module is a self-contained chunk of UI that can be loaded into Stripes, and which therefore must conform to various requirements. The source-code for a module is generally held in a git project whose name begins `ui-`.

A module is presented as an [NPM package](https://en.wikipedia.org/wiki/Npm_(software)). In addition to [the usual information in its `package.json`](https://docs.npmjs.com/files/package.json), a Stripes module must provide a `stripes` entry containing metadata describing the module and providing information that stripes-core can use to implement aspects of its functionality.

When a user enters an application module, its top-level component -- usually `index.js` is executed, and whatever it exports is invoked as a React component with the `actAs` prop set to "app". When a user enters a settings module or the settings of an application module, that same component is invoked, but now the `actAs` prop will be set to "settings". Other module types are similarly reflected in `actAs`.


#### The package-file `stripes` entry

Within the `stripes` top-level key of a Stripes module's package file, the following information must be provided:

* `actsAs` -- a short string (or array of them) indicating how Stripes should consume the module. Acceptable values are one or more of:
  * `app` -- a regular application, which is listed among those available and which when activated uses essentially the whole screen.
  * `settings` -- a settings pane that is listed in the settings menu.
  * `plugin` -- a plugin module that can be included by a component any other module, whether app, settings or another plugin. See [below](#plugins).
  * `handler` -- a handler module which will be initialized and rendered when certain FOLIO events (`login`, `logout`) occur in the system. See [below](#handlers-and-events).

* `pluginType` (only for modules of type `plugin`) -- an indication of which pluggable surface the module can be mounted on. See [below](#plugins).

* `displayName` -- [a translation ID](./i18n.md) to the name of the module as it should be viewed by human users -- e.g. "ui-search.title".

* `route` -- the route (partial URL) by which an application module is addressed: for example, the Okapi Console module might be addressed at `/console`. The same route is used as a subroute within `/settings` to present the module's settings, if any.

* `home` -- the first page of the module that should be presented to users, if this is different from the `route`. (It may be different because of default options being selected: for example, the Users module might be set up so that by default it limits its user-list to active users: this could be expressed with a `home` setting of `/users?filters=active.Active`.)

* `okapiInterfaces` -- an optional object containing dependencies on back-end modules provided via Okapi. Each dependency is expressed by an entry whose key is a FOLIO interface name such as `users` or `circulation`, and whose corresponding value is a two-faceted [interface-version number](https://github.com/folio-org/okapi/blob/master/doc/guide.md#versioning-and-dependencies). Each entry expresses a dependency on the specified Okapi interface at the indicated version or higher (but within the same major version).

* `optionalOkapiInterfaces` -- an optional object specifying back-end modules that Okapi _may_ provide, and whose presence the current module responds to, but whose absence does not impede the current module's functioning: for example, the Users app may declare an optional interface for `circulation`, and its UI may provide information about users' loans when that interface is present. The format is the same as that of `okapiInterfaces`.

* `permissionSets` -- an optional list of permission-sets describing access to parts of the user-facing application that the module implements. These will typically be very high-level permissions, most likely defined as the union of several high-level permissions provided by back-end modules. They are provided in exactly the same format as those in [a back-end module's `ModuleDescriptor.json`](https://github.com/folio-org/okapi/blob/master/doc/guide.md#example-4-complete-moduledescriptor).

* `queryResource` -- if defined, this is the name of an anointed stripes-connect resource whose contents always reflect the query parameters of the URL, and which can be mutated to change the URL. See [URL navigation](#url-navigation) below.

* `links` -- an optional object which specifies any module-specific links that should be included in the Stripes chrome. See [Links](#links) below.

* `handlerName` -- an optional string indicating the name of a static function that is part of the class exported by the module. If provided, this is used to handle various kinds of events as discussed [below](#handlers-and-events).

* `stripesDeps` -- an array declaring any NPM dependencies of this module that Stripes needs to gather resources from. Currently these include: icons and translations. Eg, `stripesDeps: ["@folio/stripes-erm-components", "@opentown/opentown-components"]`

The class exported by a module may also have a static data member, `actionNames`. If provided, this must be an array of strings, each of them the name of an action that can be invoked by hot-keys (see [below](#enabling-hot-keys)). Stripes will aggregate the action-names exposed by the available modules and provide a combined list as [the `actionNames` member](#actionNames) of the Stripes object.


#### Skeleton module

In its early stages, the Organization module, [`ui-organization`](https://github.com/folio-org/ui-organization), provided a good example of what is required. If you are looking for a template on which to base your own module, [commit 98cdfee0](https://github.com/folio-org/ui-organization/tree/98cdfee0fab4f74b9dc3e412b81a433121de5631) is a good place to start.



### Code quality


#### ESLint

In general, we expect every module to pass [ESLint](http://eslint.org/) without errors. (Run `yarn lint` in the project directory to check: new modules should be set up so that this works.) This does not necessarily mean that you must slavishly obey every order of ESLint: you may judge that one of its rules is foolish, and configure it not to apply -- for example, sometimes [`no-nested-ternary`](http://eslint.org/docs/rules/no-nested-ternary) impedes the most natural way to express an idea. But use [`eslint-disable` comments](http://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments) judiciously, only after carefully considering whether the code really could be rewritten in a clearer way. If you need to disable a line, specify which particular rule you are disabling -- i.e. prefer `// eslint-disable-line global-require` over simple `// eslint-disable-line`.

#### Use of the JavaScript console.

All module code should run without leaving warnings in the JavaScript console. If you find a warning, hunt it down and fix it. Some warnings, especially from React, presage very bad and unpredictable things.

In checked-in code, modules should not emit console message using `console.log` and similar -- although it can be useful to add such lines on a temporary basis during development. ESLint will help you find any stray logging commands. All console output should be generated using stripes-logger, as described [below](#logging).


#### Unit-testing

We aim to write unit tests (generally using [Mocha](https://mochajs.org/)) though at present we are not as far along with this as we might wish. Over time, we will develop conventions for how best to mock parts of FOLIO for testing purposes.


#### Code-review

If you are not sure about some code you have written, ask for a code review from another member of the team. We do _not_, as a matter of course, review all code: our judgement at present is that doing so would cost us more than it bought us.



### Specifying dependencies

ESLint cleanliness means, among other things, that every package a module uses must be listed as a dependency in its `package.json`. Packages containing components that will be shared across module boundaries must be included as peerDependencies. Even API-compatible versions of a package (i.e. with a difference only in the minor or patch version) will cause React to crash if multiple versions are included in the bundle and their components are exchanged across modules, e.g. a `Route` in an app is rendered within the `Router` context provided by stripes-core and the app and stripes-core have different versions of react-router.

Let `yarn` help you manage your packages. It's better at alphabetizing things than you are:

```
yarn add _packageName_
yarn add --peer _packageName_
```

The following packages must be included as peerDependencies only. They will be provided to the bundle by the platform's `package.json` where they will be specified as dependencies:
* react
* react-dom
* react-redux
* react-router
* react-router-dom
* redux
* rxjs
* @folio/stripes

Don't forget to include dependencies where Stripes needs to gather translations as `stripesDeps` (for example: `stripes-erm-components`).

## Guidelines for structuring your Stripes module



### Define all your routes at the top

Although `react-router` encourages it, nesting `<Route>` components throughout the module and dependencies can complicate refactoring. Instead, prefer to contain all routes in the top-level `index.js`. Beyond making it easier to move things around, this serves to quickly orient any developers new to the codebase. Also helpful for those who haven't seen it in a while.

To help facilitate, `stripes-core` exports a wrapper for `<Route>` which will pass children of a route into the component responsible for rendering it. For example, in this JSX, `<SettingsLayout>` would be passed the children of the the `<Route>` that points to it which it could then into an appropriate part of the layout it provides:

```
<Route path="/settings" component={SettingsLayout}>
  <Switch>
    <Route path="/settings/foo" component={FooSettings}/>
    <Route path="/settings/bar" component={BarSettings}/>
  </Switch>
</Route>
```

NB. This only passes children into a component specified via the `component` prop.


### Fetch data in the route component

Similarly, it helps to group all data access in the component handling the route. Not only remote data, but data persisted in state management tools and browser storage. Most data needs will be implied by the URL, beyond a few exceptions like autocomplete fields and intentional lazy-loading of collapsed components not toggled in the URL. For the rest, choosing to get all the data up front in the component handling the route and pass it down from there provides several benefits:

* reduces coupling to the service APIs and makes it easier to maintain as our tools for accessing them evolve
* prevents unnecessary flickering as nested components are progressively populated
* a page transition is a natural time for users to expect a delay for fetching
* naturally encourages good practice
  * separation of business logic and presentation
  * "data down, events up"

To help people find their way around the module, group these components together in `src/routes`. While you might name the folder something else, this pattern can still apply to modules without routes (such as plugins) where data access can be floated as high as it will reasonably go in the component hierarchy and these container components grouped together.


### Be wary of reusing glue

In Stripes, and component-based design more generally, the goal is to build self-contained abstractions of some specific functionality. Components are thus largely concerned only with what is passed in as props. "Glue" is everything else that strings them together to form a cohesive app. For example:

* persisting state locally or to a remote service
* <Route> components, updates to the URL
* managing focus as users move through the app

It was considered that Stripes should simply avoid reusing this type of code. Some repetition would allow us the flexibility to refactor applications quickly on a case by case basis as they would not be coupled to a big abstraction where making use of it is an all-or-nothing proposition. However, inevitably there are patterns in our application and data model where it'd be expedient if we could reuse a large swath of code, glue and all. So it makes sense to plan for that:

1. build reusable functionality without glue code
1. layer reusable glue on top of that

The goal is that consuming applications are able to gracefully back out of the abstraction you provide and the expectation is that what they will most likely want to change is in the glue code. It helps to work along similar lines to what we propose for apps -- all the routes in one place, data is fetched in the components that handle the routes. This way most of your shared code can still be used in an app that is being refactored to persist the data somewhere else, name the routes differently, or lay things out in a different structure.


### The URL should reflect what's on the screen

In past we'd persist some state in the URL for parts of the interface that were hidden behind one or more full page overlays. This became difficult to manage and resulted in delay when linking directly to the overlay as the underlying page often needed to fetch data. In order to avoid this situation, prefer instead to use a new route and have the close button link back to the previous page.




## Development



### The Stripes object

Programming in Stripes is essentially [programming in React](https://facebook.github.io/react/docs/thinking-in-react.html), with one big difference: the provision of the Stripes object. As with regular React, data flows down through components (as props) and actions flow up.

The Stripes object is provided as the `stripes` property to the top-level component of each module. For convenience, it is also placed in the React context where it can be readily retrieved via the `withStripes` wrapper or `useStripes` hook both exported from stripes-core. It is up to each component to choose whether to get it from the property or the context; and, if necessary, to pass the prop down to its children.

The Stripes object contains the following elements:

* `locale` -- a short string specifying the prevailing locale, e.g. `en-US`. This should be consulted when rendering dates with `toLocaleDateString`, etc.

* `bindings` -- an object specifying key-bindings for actions that can be activated by hot-keys. The keys of the object are action names such as `stripesHome` and `pageDown`, and the corresponding values are key-combination specifications as defined by [the Mousetrap library](https://github.com/ccampbell/mousetrap), such as `command+up`. At startup, Stripes loads these bindings from the configuration module and applies them to all components making up the Stripes application: it is up to the individual modules to link the action-names with actual code using a `<HotKeys handlers={someObject}>` wrapper -- see [below](#enabling-hot-keys).

* `setLocale` -- a function by which client code can change the prevailing locale: `stripes.setLocale('en-US')`. (Simply assigning to `stripes.locale` will not work.)

* `setSinglePlugin` -- a function by which client code can change the preferred module used to satisfy a specified plugin type: `stripes.setSinglePlugin('markdown-editor', '@folio/plugin-markdown-better')`.

* `setBindings` -- a function by which client code can change the prevailing key bindings: `stripes.setLocale(someObject)`. This is provided for the use of key-bindings editors such as the one provided in the **Key bindings** settings of the `ui-organization` module.

* `setToken` -- a function by which client code can change the authentication token used in communication with Okapi. This can be used to implement single-sign-on (SSO).

* <a name="actionNames">`actionNames`</a> -- an aggregated list of all the action names declared by the loaded modules. This is of use to key-bindings editors which need to know what actions to define key-combinations for.

* `plugins` -- an indication of which plugins are preferred for each plugin type. Represented as a map from plugin-type to the module name of the preferred implementation. **Application code should not need to consult this: it is used by the `<Pluggable>` component.**

* `connect` -- a function that can be used to connect subcomponents to [stripes-connect](https://github.com/folio-org/stripes-connect), enabling that module to use [the Stripes Connect API](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md) to communicate with WSAPIs such as those provided by Okapi.

* `hasPerm` -- a function that can be used for [checking whether the presently logged-in user has the specified permissions](#testing-for-permission).

* `hasInterface` -- a function that can be used for [checking whether the connected Okapi instance supports [a specified interface at a compatible version](#testing-for-interfaces).

* `logger` -- a [stripes-logger](https://github.com/folio-org/stripes-logger) object that has been configured for Stripes and can be used in the usual way: see [Logging](#logging).

* `discovery` -- a structure describing the modules and interfaces provided by Okapi, as described [below](#the-discovery-structure).

* `store` -- the application's [Redux](https://github.com/reactjs/redux) store. **In general, you should not use this**, relying instead on the Stripes Connect facilities; but it is provided as a backdoor which developers can use with discretion. See [Appendix A](#appendix-a-escaping-to-redux).

* `okapi` -- a structure containing configuration information about the connection of Okapi:

  * `url` -- the base URL used in communication with Okapi. **In general, you should not use this** but there may be times when it is necessary to make an out-of-band call using [`fetch`](https://github.com/matthew-andrews/isomorphic-fetch) rather than have Stripes Connect handle communication.

  * `tenant` -- the unique ID of the FOLIO tenant that is being accessed.

* `user` -- a structure containing configuration information about the presently logged-in user:

  * `perms` -- the set of permissions associated with the logged-in user, as described [below](#the-permissions-structure).

  * `user` -- an object containing metadata about the logged-in user, with fields such as `email`, `first_name`, and `last_name`.

* `config` -- a structure containing misleading configuration information, including:

  * `disableAuth` -- whether authentication is disabled. **NOTE.** This is deprecated. Support for it will probably be removed, since an unauthenticated session is increasingly useless.

  * `autoLogin` -- if provided, an object containing `username` and `password` members which are used to automatically log the user in when Stripes starts up. **Think carefully before using this**. It is a boon during rapid development when many reloads are needed, but has the obvious security implication of storing a server-side password in clear text on the client side.

  * `logCategories`, `logPrefix`, `logTimestamp` -- see [Configuring the logger](#configuring-the-logger) below.

  * `showHomeLink` -- a boolean indicating whether the user menu at top right should include a link to the FOLIO home-page. This is useful in development, as it gives a clean state to reload, but not wanted for production.

  * `showPerms` -- a boolean indicating whether the user menu at top right should display a list of the logged-in user's permissions. This is useful in development, but distracting in production.

  * `listInvisiblePerms` -- usually, when a list of available permissions is provided from which to choose one to add, only "logical permissions" (those with `visible:true`) are listed. When `listInvisiblePerms` is set, however, low-level permissions are also included.

  * `hasAllPerms` -- a boolean indicating whether to assume that the user has all permissions. Obviously this should usually be false (the default); setting it to true can be useful in development, but does not grant any real escalation in privilege, since server-side permission checks cannot be bypassed.

  * `welcomeMessage` -- the name of a translation key, such as `ui-rs.front.welcome`, which is looked up in the prevailing locale to obtain the welcome message shown on the FOLIO app's home page. If not specified, defaults to `stripes-core.front.welcome`.

  * `platformName` -- a short string naming the application platform, which is used in the window title and in the home page's main caption. If not specified, defaults to `FOLIO`.

  * `platformDescription` -- a longer string describing the application platform, which is not currently used but could for example be hover text for the home page icon. If not specified, defaults to `FOLIO platform`.

  * `showDevInfo` -- not used internally by Stripes itself, but conventionally used by applications to determine whether or not they should display information of interest only to developers, such as JSON dumps of record objects.

  * `suppressIntlErrors` -- a boolean which, when true, will suppress errors from react-intl including those complaining of a translation key missing its translation.

For convenience in declaring the property-type of the Stripes object, a `stripesShape` object is provided, and can be imported from `@folio/stripes-core/src/Stripes`.


### Connecting a component

The top-level component of each module is automatically connected, so that it can use the stripes-connect facilities. However, components included within this top-level one, whether directly or indirectly, must be connected using the curried-connect function provided in the Stripes object.

Because connecting is a non-trivial operation, it is best to do this once in the constructor of the containing component rather than inline in its `render` method where it will be activated many times. The standard idiom is:

```js
import { stripesShape } from '@folio/stripes-core/src/Stripes';
import Child from './Child';

class Parent extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
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

#### Specifying parameters, including limits

Along with the `path` of an Okapi-type resource, it is also possible to specify `params`, which are built into a complete URL. For example, consider a manifest like the following:

```
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
    },
```

This will be compiled into an access URL like `/groups?query=cql.allRecords=1+sortby+group&limit=40`. Specifying params individually is more flexible and less error-prone than constructing such URLs by hand.

Note that whenever a client is fetching a list of records -- for example, to populate a dropdown for editing a record -- it should explicitly specify the limit of how many are required, rather than leaving it to the server's unpredictable default.


### URL navigation

Stripes modules do not need to directly manipulate the URL of the application using `history.push(newUrl)`, nor parse out the parts of the URL to access query parameters. This is all handled by means of an "anointed resource" -- a stripes-connected local resource which is nominated by the `queryResource` entry in the package file's `stripes` section. (Typically, this resource is called `query`, though it need not be.)

When such a resource is declared, stripes-core ensures that it is populated with the URL query parameters -- for example, when at the URL `/users?filters=active.Active&query=ab&sort=Name`, the resource will contain three keys: `filters` with value `active.Active`, `query` with value `ab`, and `sort` with value `Name`.

Assigning a value in this resource (using the `update` or `replace` mutator) will result in the URL changing accordingly: for example, starting from the state above, setting `sort` to `Email` will result in the URL changing to
`/users?filters=active.Active&query=ab&sort=Email`. This facility frees applications from having to track the existing path and other query parameters in order to construct a new URL that is consistent with the old except for the change of a single parameter.

As a special case, assigning to the parameter `_path` results in a change to the URL _path_ rather than a query parameter. (Don't write your application so that it uses a query parameter called `_path` or it won't work!)

To get a sense for how this works in practice, look at [the `<SearchAndSort>` component](https://github.com/folio-org/stripes-smart-components/blob/master/lib/SearchAndSort/SearchAndSort.js). A simple `transitionToParams` utility function is trivially defined as mutating the anointed resource:
```
this.transitionToParams = values => this.props.parentMutator.query.update(values);
```
That method is used in many places, for example, to change the `sort` parameter to the value of the `sortOrder` variable:
```
this.transitionToParams({ sort: sortOrder });
```
And with the special `_path` parameter to change the path when a single record is selected for display. In this case, the base-route is taken from the component's properties (and ultimately from the `stripes.route` property of the package file), and the ID of the record to display is drawn from the event metadata:
```
this.transitionToParams({ _path: `${this.props.baseRoute}/view/${meta.id}` });
```

Access to the anointed resource can be obtained by declaring it in the manifest of a connected component:
```
static manifest = Object.freeze({
  query: {
    // You can declare the specific query parameters here
  }
});

```
More often, a high-level component will pass a reference to the resource into lower-level components that use it. In the example above, modules using the `<SearchAndSort>` utility component will pass in their stripes-connect resources and mutators as the `parentResources` and `parentMutator` properties, as seen in the definition of the `transitionToParams` utility function above.



### Enforcing permissions

Users in the FOLIO system have a set of permissions assigned to them. These are named by short strings such as `users.read`, `users.edit`, `perms.permissions.create`, etc. Operations are allowed or prohibited by server-side modules according as the logged-in user does or does not have the corresponding permissions.

However, in order to prevent misleading the user, or provoking inevitable authorization errors, good UI code also checks the available permissions, and does not provide the option of attempting operations that are doomed to fail. It does this by consulting the user's list of permissions and checking to see whether they include the one necessary for the operation in question.


#### The permissions structure

The permissions are provided to the top-level component of each module as the `users.perms` element of the `stripes` property; it is the responsibility of that component to make the `stripes` object available to other components -- either by passing it as a property (`<SubComponent ... stripes={this.props.stripes}>` or by installing it in the React context.

The `perms` structure is a JavaScript object whose keys are the names of the permissions that the user has, and whose values are the corresponding human-readable descriptions. For example, the `users.read` permission might have the descriptions "Can search users and view brief profiles".


#### Testing for permission

Generally, code should not assume that the `user.perms` element of the `stripes` component exists, since the initial render of some components may happen before a user has logged in. So a permission such as `this.props.stripes.user.perms['users.read']` should be checked only after the existence of the permissions structure has been verified. The easiest way to do this is using the `stripes` object's `hasPerm` method:

```
if (this.props.stripes.hasPerm('users.read')) ...
```

The argument to this method is a comma-separated list of permissions (or, in the common degenerate case, a single permission). It returns true only if the user has _all_ the specified permissions.

When guarding small elements, such as a "New user" button that should appear only when when the `users.create` permission is present, the helper component [`<IfPermission>`](https://github.com/folio-org/stripes-components/blob/master/lib/IfPermission/readme.md) can be used:

```js
<IfPermission perm="users.create">
  <Button fullWidth onClick={this.onClickAddNewUser}>New user</Button>
</IfPermission>
```



### Checking interfaces

A Stripes application is dependent on the Okapi instance that it is connected to. Different Okapi instances have different sets of modules running. Each Okapi module implements one or more named interfaces at a specified version: for example, the module with the identifier `users-module` may provide the `users` interface at version 10.0 and the `_tenant` interface at version 1.0.0.

A well-behaved Stripes application will avoid making requests of back-end modules that are not available. Stripes provides facilities making this possible.


#### The discovery structure

At startup time, Stripes probes its Okapi instance to discover what modules it is providing access to, and what interfaces they provide. The resulting information is made available as an object in the Stripes module, accessible as `stripes.discovery`. It contains three elements:

* `version` contains the version number of Okapi itself.

* `modules` is a map whose keys are module identifiers such as `inventory-storage`, with corresponding values that are human-readable names such as "Inventory Storage Module".

* `interfaces` is a map whose keys are interface identifiers such as `loan-storage`, with corresponding values that are two-faceted (_major_._minor_) version numbers such as 1.2 (see the _Okapi Guide_'s [section on interface versions](https://github.com/folio-org/okapi/blob/master/doc/guide.md#versioning-and-dependencies)).


#### Testing for interfaces

The easiest way to check that an interface is supported, is by using the `stripes` object's `hasInterface` method:

```
if (this.props.stripes.hasInterface('loan-storage', '1.0')) ...
```
If the interface is supported at a compatible level (same major version number, same or higher minor version number), then it returns the supported version number. The required-version number may be omitted from the call (`hasInterface('loan-storage')`). In this case, it returns `true` if the named interface is supported at any level.


When guarding small elements, such as the invocation of a component that will display user loans that should appear only when when the loans interface is present, the helper component [`<IfInterface>`](https://github.com/folio-org/stripes-components/blob/master/lib/IfInterface/readme.md) can be used:

```js
<IfInterface name="loan-storage" version="1.0">
  <ViewUserLoans />
</IfInterface>
```



### Enabling hot-keys

Stripes itself manages the mapping of key-combinations such as `command+up` and named actions such as `stripesHome`. Action names can be any short string, but by convention we use camel-case.

This mapping can most easily be managed by means of the editor in the `ui-organization` module; more sophisticated facilities may follow.

In order to actually use the mapped keys, the action-names must be mapped to code fragments, and this is the responsibility of the individual modules. Mappings are passed as the `handlers` argument to a `<HotKeys>` wrapper component, which is provided by [the `react-hotkeys` library](https://github.com/chrisui/react-hotkeys). For example, consider this code from the hot-keys testing page in `ui-developer`:
```
import { HotKeys } from '@folio/stripes-components/lib/HotKeys';
// ...
const handlers = {
  stripesHome: () => { props.history.push('/'); },
  stripesAbout: () => { props.history.push('/about'); },
};
// ...
<HotKeys handlers={handlers} noWrapper>
  // ... elements which, when focussed, support the hot-keys
</HotKeys>
```

This maps the two action-names `stripesHome` and `stripesAbout` to JavaScript fragments that navigate directly to the home-page and the About page respectively. Stripes itself supplies the bindings that specify what particular key-combinations invoke these actions.

Finally, a wrinkle: in some circumstances, inserting a `<HotKeys>` wrapper around other elements interferes with the application of CSS styles. In this case, the `nowrapper` property can be used to circumvent this. But the property is not yet supported by the master distribution of `react-hotkeys`, so it's necessary to use the forked copy `stripes-react-hotkeys` until the master is updated.



### Logging

Logging in Stripes is done using [stripes-logger](https://github.com/folio-org/stripes-logger), a simple generalisation of `console.log` where each message is assigned to a category, and the developer can decide at run-time which categories should be emitted and which ignored. In this way, it's possible to see (for example) only logging of how stripes-connect paths are resolved.


#### Configuring the logger

The `config` section of the Stripes configuration file -- usually called `stripes.config.js` or similar -- can be used to configure logging. The three relevant settings are:

* `logCategories` -- a comma-separated list of categories to include: for example, `'core,action,path'`. If this is not specified, the default is to log the single category `redux`. (See below for existing categories.)
* `logPrefix` -- a string which, if defined, is included at the start of all log messages. This can be explicitly set to `undefined`, but defaults to `'stripes'`.
* `logTimestamp` -- a boolean which, if true, results in an ISO-format timestamp being emitted at the start of each logged message (after the logPrefix, if any). Defaults to false.

The stripes-core library lets you make up categories on the fly -- so, for example, a Circulation module might use the category `'circ'`. But some categories are in use by Stripes itself, and can usefully be included in the logCategories setting. These include:

* `core` -- messages emitted by stripes-core itself.
* `redux` -- messages generated by the `redux-logger` library, describing Redux actions.
* `connect` -- notifications from stripes-connect when connecting or refreshing a component
* `connect-fetch` -- very verbose logging of all data fetched by stripes-connect
* `substitute` -- messages generated by stripes-connect describing how paths are generated by string substitution and fallback.
* `mpath` -- conventionally used by application modules to log path generations by path functions.
* `action` -- conventionally used by application modules to log user actions such as searching, sorting and editing.
* `perm` -- emits a message whenever a permission is checked, whether successfully or not.
* `interface` -- emits a message whenever an interface is checked, whether successfully or not.
* `xhr` -- conventionally used by application modules if for some reason they have to execute their own XML HTTP Request (or more often, these days, JSON HTTP Request). Note that in general, **modules should not do this** but should use the facilities provided by stripes-core.


#### Using the logger

The configured logger object is furnished as the `logger` element of the `stripes` property to the top-level component of each UI module. It is the responsibility of that component to ensure it is passed down to any subcomponents that need to use it. Logging can therefore be invoked using `this.props.stripes.logger.log('cat', args)`.

In addition, the logger is passed as the fourth argument into stripes-connect path functions.

#### Redux-DevTools-Extension
 Stripes will be sending the Redux actions and state details to the  [Redux Devtools Extension](https://github.com/zalmoxisus/redux-devtools-extension) which should be installed in the browser.



### Plugins

Any component may be substituted by a plugin. This is simply a module whose type is `plugin`. Plugin modules have a lower-level type, represented by a `pluginType` field in the `package.json`. Plugin types might be "markdownEditor", "MARCViewer", etc.

Other kinds of module have hardwired locations: `app` modules get rendered into the main area; `settings` modules get rendered into the settings area. But `plugin` modules don't get rendered at all by default -- only when called on by a pluggable surface in another module.

This is done by means of the `<Pluggable>` component. It must be passed a single prop, `type` -- a short string which is matched against the `pluginType` of the available plugins. It contains as children a default set of components to be rendered if no plugin is available:

```
<Pluggable type="markdown-editor">
  <div style={{ background: 'red' }}>Markdown editor goes here</div>
</Pluggable>
```

This renders the red "Markdown editor goes here" message by default; but if there is an available plugin module whose plugin-type is `markdown-Editor` then its top-level component is rendered instead.

There may be multiple plugins of the same plugin type; in this case, a setting in the database indicates which of the extant plugins is to be used. (The Preferred Plugins section of the Organization settings allows this to be configured.)



### Handlers and events

The principal means for modules to contribute functionality to the running Stripes application is by means of the components that they provide -- as a main application, as a settings sections, or both. However, sometimes it's necessary for the Stripes core code to notify modules of some event so that they can react in an appropriate way. In order to support this, there is the notion of a handler function.

A module provides a handler as a static function within the component class that it exports at the top level, and advertises its existence by specifying its name as the `handlerName` property of the package-file's `stripes` area. There can be only one handler in a module: this is used for all events, though of course different events may be handed off to further functions.

Stripes modules of any type can provide a handler; the `handler` module type is provided for the case where the handler is the _only_ thing the module provides, i.e. there is no main-screen app and no settings.

Handlers are invoked in two situations: when core events occur, and when module-specified links are rendered:

* There is a small, defined set of core events, which can be imported as `coreEvents` from `@folio/stripes-core/src/events`. This file exports an object with constant string members named `LOGIN`, `LOGOUT`, etc. When a relevant event occurs within Stripes, the handler is invoked with the relevant constant.
* When Stripes is rendering an area that contains links -- for example, the user-dropdown menu at top right -- it can include links specified by the module, as described [below](#links). Links may be specified to invoke an event, in which case clicking the link invokes the handler with the event-name as a string.

The handler is defined as:

```
static eventHandler(event, stripes, data) { ... }

```

The first argument is the event to be handled, which is either one of the core events defined in `@folio/stripes-core/src/events` or one of the link events defined by the module itself.

The second argument is [the Stripes object](#the-stripes-object), exactly as passed to the module's application and settings components.

The third argument is an object containing additional information pertaining to the event. The keys of the object and their corresponding values are dependent on the specific event. For module-defined events used to create links, the object is the one describing the module itself. For the core events, it varies as follows:

* `LOGIN` (invoked when a user logs in): no additional data.
* `LOGOUT` (currently never invoked): no additional data.
* (There will no doubt be more to follow.)

The handler may return either `null`, if has completed its work, or a component which Stripes will render as a modal.


### Links

A module may need to insert links into various parts of the Stripes web-application -- for example, the My Profile module needs to add a "change password" link to the user dropdown menu at top right. To do this, a module should include specifications of its links in a `links` section in the `stripes` area of its package file.

If specified, `stripes.links` is an object whose keys are the names are the areas in which to add links: presently only `userDropdown` is supported, indicating the menu under the user-profile icon; support for additional areas will be added as needed.

The corresponding values are arrays containing a list of items to add to the specified area. Each entry in the list is an object with at least two of the following keys: `caption` and one or other of `route` and `event`:
  * `caption` -- the translation key used to find the human-readable label of the menu-item.
  * `route` -- the route which clicking on that menu-item navigates to. This can be used in the simple case when the link is merely a shortcut to a page provided by the manual.
  * `event` -- if provided in place of `route`, specifies an event that is delivered to the module's handler function (see above), which the module must have defined. That handler can take whatever action is wishes, and may return a component which is displayed as a popup.
  * `check` -- if defined, the name of a function which checks whether or not to show the link, returning true or false. This function must be provided as a static method of the class exported by the module.

Examples:
* [The "change password" link in the `ui-myprofile` package](https://github.com/folio-org/ui-myprofile/blob/acbe369e487cb43a053420e42275433cb97f7a8e/package.json#L35-L42).
* [The "change service-point" popup in the `ui-servicepoint` package](https://github.com/folio-org/ui-servicepoints/blob/7846e3c5a65578b530ebc18849809c25cd334e2e/package.json#L17-L23)



### Internationalization

Stripes contains provisions for localising a module. At any moment, there is a notion of the currently prevailable locale, which can always be obtained using `stripes.locale`, and which may be changed on the fly using the `stripes.setLocale` function. The stripes-core code itself makes some use of this locale -- for example, the front page's welcome messages are translated accordingly -- but since modules provide much more of the UI, they are largely responsible for taking the locale into account. This is done most prominently through the provision and use of translations.


#### Creating module translations

Translations in Stripes are user-readable strings which are named with a short, faceted, machine-readable key such as `ui-users.loans.openLoans` for the Users module's "Open loans" caption on the Loans page.

A module's translations must be provided within a `translations` directory found at the root of the module. This directory contains `.json` files whose names are two-letter ISO country codes such as `en.json` for English or `de.json` for German, each such file providing the module's translation strings for the named language.

The translations themselves, within these files, have short, faceted keys, and their values are the strings that are to appear in the UI. The name of the module is automatically prepended to the translation keys. For example, in the User module's `translations` directory, the `en.json`, file contains:

```
{
  "search": "Search",
  "loans.title": "Loans",
  "loans.openLoans": "open loans",
  "loans.closedLoans": "closed loans"
}
```
and the `de.json`, file contains:

```
{
  "search": "Suche",
  "loans.title": "Ausleihen",
  "loans.openLoans": "Offene Ausleihen",
  "loans.closedLoans": "Abgeschlossene Ausleihen"
}
```

These files provide English and German translations for four strings, whose keys are `ui-users.search`, `ui-users.loans.title`, `ui-users.loans.openLoans` and `ui-users.loans.closedLoans`.

Translations may be provided for any number of languages.


#### Using module translations

Translations are used by referencing their keys in code, at which point the locale-appropriate translation is used. This can be done in two ways:

In HTML, [the React component `<FormattedMessage>`](https://github.com/yahoo/react-intl/wiki/Components#formattedmessage), which is provided by the react-intl library. The translation key must be provided as the `id` parameter: for example, `<FormattedMessage id="ui-users.loans.title" />` will render "Loans" if the prevailing locale's language is English, and "Ausleihen" if it is German.

In JavaScript, the Stripes object furnishes an internationalization object as its `intl` property, and [its `formatmessage` function](https://github.com/yahoo/react-intl/wiki/API#formatmessage) can be used. It must be passed an object whose `id` property is a translation key: for example, `stripes.intl.formatMessage({ id: 'ui-users.search' })` will yield "Search" if the prevailing locale's language is English, and "Suche" if it is German.


#### Using core translations

In addition to the translations that it provides itself, a module may use translations provided by stripes-core. In particular, it provides translations for a set of common labels, which modules therefore need not translate for themselves. The keys for these labels all begin with `common.`. The translations provided by stripes-core are provided in [language-specific translation files](https://github.com/folio-org/stripes-core/tree/master/translations/stripes-core).

For example, if the `stripes-core/translations/stripes-core/*.json` files define a property as `"common.search": "Search"`, then the translation can be done like so:
```
<Button label={stripes.intl.formatMessage({ id: 'stripes-core.common.search' })} />
```

#### Translating permission names

The `permissionSets` defined in an app's package.json each contain a `permissionName` which serves as an ID (eg, `ui-users.create`). These IDs should not be used in user-facing displays. Instead, the `permissionName` is changed to create an translation key which is then passed to react-intl which looks up the localized string. Some examples of this change would be:

- `ui-users.create` -> `ui-users.permission.create`
- `ui-agreements.agreement.view` -> `ui-agreements.permission.agreement.view`

Note the only change is inserting `permission.` after the first period. This means that because the generated translation key needs to begin with the module providing the translation, permissions that are intended to be shown in the UI (ie, have `visible: true` set), should always have a `permissionName` that begins with the app's ID (eg, `ui-users`).

#### Filtering translations at build time

By default, the build process will collect translations for all languages found in each module.  Sometimes it is desireable to build a tenant with only a specific set of languages.  To filter the languages for a tenant, set the `languages` property in the `config` section of the tenant's `stripes.config.js` file.  The value should be an array of desired two-letter codes.  For example:
```
config: {
  languages: ['en', 'de'],
},
```
In addition to limiting the number of translations processed during the build, specifying `languages` will also prompt the build to filter out third-party language assets for `react-intl` and `moment`.  This will reduce the quantity and size of build files emitted.


#### Other uses of the locale

Besides translating strings, the prevailing locale can be used to influence other aspects of the user interface. For example, it can be used to render dates in the appropriate format: using `new Date(Date.parse(dateStr)).toLocaleString(stripes.locale)`, the date 5 March 2017 appears as `3/5/2017` in the USA, `05/03/2017` in the UK and `5.3.2017` in German.



### Styling HTML

In general, modules should not use CSS directly, nor rely on styling libraries such as Bootstrap, but should use low-lever components from `stripes-components`, which are pre-styled according to Stripes conventions.



### Network tab in Google Chrome

When using the network tab in Google Chrome to watch the requests and responses you may put `-method:OPTIONS` in the filter at top left to suppress non-relevant traffic.




## Thinking in Stripes



### Principles of stripes-connect

When programming with stripes-connect, you do not directly interact with the back-end web-services. There is no sending of requests or handling of responses -- the stripes-connect library deals with all that. Instead, UI components do three things:

1. They make a declarative statement of what back-end information they need, in the form of a _manifest_. The manifest provides information about a number of _resources_, each of which corresponds to data available from the back-end. Most importantly, each resource specifies how various parts of state -- URL path components and query parameters, local state such as form values, etc. -- is composed into a web-service URL used to access the back-end web-service.

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


#### Note on sharing resources between components

Manifests are declared on the component level; however, resources are maintained at the module level. This means that same-named resources in two components that are part of the same module actually refer to the same resource.

This has the benefit that it provides a way for multiple components to share information. For example, a SearchPreferences component might set a local resource `sortOrder` which is subsequently used by the Search component when formulating queries.

However, it's also a trap for the unwary: _inadvertently_ re-using a resource name in separate components of a module can have confusing results. So when thinking about your manifests, take a whole-module approach rather than thinking only about the component in hand.

(Of course, it's easy to make component-specific resource names that are unique module-wide, by combining the name of the component with that of the resource: `SearchPreferences_sortOrder` vs. `Search_sortOrder`, for example, if for some reason you wanted to keep these two resources separate.)



### Modifiable local state

The manifest is immutable, and shared between all instances of a component. By contrast, each instance of a component has its own local state, and may change it at any time.

State is of several kinds:

* React state, which may be modified at any time using React's standard `setState()` method. This is typically how components keep track of UI elements such as query textboxes and filtering checkboxes -- see the React documentation on [Forms and Controlled Components](https://facebook.github.io/react/docs/forms.html).

* Stripes-connect resources of type `local` (as opposed to `rest` or `okapi`). Changing these does not cause a change on a remote resource, only locally. They differ from the React state in that they are persistent across renderings of the same component: for example, if a UI module's search-term is held in a local resource rather than in React state, it will still be there on returning to that module from another one within the same Stripes application.

* The present URL of the UI application, which typically carries state in both its path and its query: for example, the URL `/users/123?query=smith&sort=username` contains a user-ID `123` in its path, and a query `smith` and sort-specification `username` in query parameters `query` and `sort` respectively. This state accessed and modified via the anointed stripes-connect resource -- see [above](#url-navigation).

Stripes-connect detects changes to the state, and issues whatever requests are necessary to obtain relevant data. For example, if the URL changes from `/users/123?query=smith&sort=username` to `/users/123?query=smith&sort=email`, it will issue a new search request with the sort-order modified accordingly.



### Firing actions

Every connected component is given a property called `mutator`. This is an object whose keys are the names of the resources specified in the manifest, and whose values are objects containing functions that can act upon those resources. These functions each take a single argument that is an object of _key_:_value_ pairs.

For local resources, there are two functions in the mutator:

* `replace` -- replaces the resources current set of values with the new set.
* `update` -- merges the new set of values into the old.

For remote resource (of type `rest` and `okapi`) there are three functions, named after the HTTP methods:

* `POST` -- creates a new record on the remote service.
* `PUT` -- updates an existing record on the remote service.
* `DELETE` -- deletes an old record on the remote service.

For these mutator functions, the argument represents a record being CRUDded to the service. Note that by design _there is no GET mutator_: applications should never need to fetch their own data, but always get it implicitly, passed into props.




## Appendix A: Escaping to Redux

**WARNING.** Do not do this.

In general, Stripes modules should never need to access the Redux store that is used internally. However, in some unusual circumstances, this may be necessary. For example, when the Users module creates a new user, it then goes on to post the user's credentials (username and password) to a different WSAPI endpoint and the user's initial set of permissions to a third endpoint. Rather than using stripes-connect for these operations, it uses low-level [`fetch`](https://github.com/matthew-andrews/isomorphic-fetch) calls; and in order to obtain the current session's authentication token to include in the HTTP calls, it looks inside the state of the Redux store.

This store is available as `store` on the Stripes object, and its state is available via the `getState` method. So:

```js
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

Note that this code does _not_ access the stripes-connect data within the Redux store: so far, no situation has been found where that is necessary or desirable. Instead, it accesses internal data about the present session. (Arguably, that data should be made available in the Stripes object; but really, module code should not need to use this at all.)

## Appendix B: Mandatory back-end services for stripes-core

Stripes-core currently requires certain server-side modules to be enabled
