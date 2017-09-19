# Stripes entities: packages, modules, apps and more

In the Stripes ecosystem, we often refer to packages, modules, apps, and other kinds of hunks of code. There is some confusion about how they relate to each other. Here is an overview.

## Component

In the context of Stripes, when we refer to a "component", we mean a [React](https://facebook.github.io/react/) component -- a special JavaScript code class that renders HTML as part of a Web application.

Components often invoke other, lower level, components to render parts of the UI element that they are responsible for.

## Smart Component

A smart component is one that communicates with an Okapi web-service in order to provide the facilities that it renders. For example, the notes that appear in the Users app are smart components, which render content fetched _from_ Okapi, and send new and modified content _to_ Okapi.

## Package

In the context of Stripes, a "package" means an [NPM package](https://www.w3schools.com/nodejs/nodejs_npm.asp). This is a separately installable unit of JavaScript software, typically providing a library or a command-line utility.

Packages may include React components, including smart components. One example is that the Notes facility is provided as a package that contains smart components.

## Module

A Stripes module, or just "module", is an NPM package that meets [specific conditions](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md#modules) which allow it to be loaded into the Stripes framework. All modules are packages, but not all packages are modules. Modules invariably contain components, since React is the technology used to render Stripes.

Modules never contain other components, but may well use packages of other kinds: for example, the ui-users module makes use of the Notes package.

## App

An app is a specific type of module: the kind that renders a whole-page application. ui-users and ui-items are apps (the Users app and the Items app respectively), which ui-organization is not (because it provides only settings pages).

## Plugin

A plugin is another type of module: the kind that, depending on configuration, may or may not appear in place of some other component. Typically, the plugin provides a more sophisticated alternative to the component: for example, a WYSIYG text editor in place of a simple HTML `<textarea>`.

It would be possible for the Users app's use of the Notes package to be mediated by a plugin. This plugin would delegate to smart components provided by the Notes package; and when it is not present, nothing at all would be rendered.

## In summary ...

* A smart component is a component
* A package contains JavaScript, possibly including components
* A module is a package that can be loaded into Stripes
* An App is a module that presents a full-screen application
* A plugin is a module that may or may not appear in place of a component

