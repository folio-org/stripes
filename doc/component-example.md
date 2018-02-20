# A component example: the **PluginType** component

<!-- ../../okapi/doc/md2toc -l 2 component-example.md -->
* [Introduction](#introduction)
* [Source code](#source-code)
* [Explanation](#explanation)
    * [Imports (lines 1-4)](#imports-lines-1-4)
    * [Definition of class **PluginType** (lines 6-94)](#definition-of-class-plugintype-lines-6-94)
    * [Property-type validation (lines 7-27)](#property-type-validation-lines-7-27)
    * [The data manifest (lines 29-42)](#the-data-manifest-lines-29-42)
    * [The constructor (lines 44-47)](#the-constructor-lines-44-47)
    * [The `changeSetting` handler function (lines 49-67)](#the-changesetting-handler-function-lines-49-67)
    * [Rendering the component (lines 69-92)](#rendering-the-component-lines-69-92)
    * [Exporting the component (line 94)](#exporting-the-component-line-94)
* [Summary](#summary)


## Introduction

The Stripes module [`ui-organization`](https://github.com/folio-org/ui-organization) provides facilities for maintaining organization-wide settings. Among these is the preferred plugin to use for each defined plugin-type -- for example, which is the preferred Markdown editor. The component that allows the preferred plugin for a single plugin type to be selected is **PluginType**. This component is defined in the source file [`ui-organization/settings/PluginType.js`](https://github.com/folio-org/ui-organization/blob/master/settings/PluginType.js). As is conventional, the filename is the same as that of the component.

The **PluginType** source code is quite short -- 94 lines including blanks and comments; 81 lines excluding them. **PluginType** is a _connected component_, and serves as a simple example for how to create such components. This document will walk through the source code and explain each section.


## Source code

This is the code as of git commit [26b1c0ab5970fbfb8d1a2c52f6190d2029c9401b](https://github.com/folio-org/ui-organization/blob/26b1c0ab5970fbfb8d1a2c52f6190d2029c9401b/settings/PluginType.js).

```
     1  // We have to remove node_modules/react to avoid having multiple copies loaded.
     2  // eslint-disable-next-line import/no-unresolved
     3  import React, { PropTypes } from 'react';
     4  import Select from '@folio/stripes-components/lib/Select';
     5
     6  class PluginType extends React.Component {
     7    static propTypes = {
     8      stripes: PropTypes.shape({
     9        logger: PropTypes.shape({
    10          log: PropTypes.func.isRequired,
    11        }).isRequired,
    12      }).isRequired,
    13      data: PropTypes.object.isRequired,
    14      mutator: PropTypes.shape({
    15        recordId: PropTypes.shape({
    16          replace: PropTypes.func,
    17        }),
    18        setting: PropTypes.shape({
    19          POST: PropTypes.func.isRequired,
    20          PUT: PropTypes.func.isRequired,
    21        }),
    22      }).isRequired,
    23      pluginType: PropTypes.string.isRequired,
    24      plugins: PropTypes.arrayOf(
    25        PropTypes.shape({}),
    26      ).isRequired,
    27    };
    28
    29    static manifest = Object.freeze({
    30      recordId: {},
    31      setting: {
    32        type: 'okapi',
    33        records: 'configs',
    34        path: 'configurations/entries?query=(module=PLUGINS and config_name=!{pluginType})',
    35        POST: {
    36          path: 'configurations/entries',
    37        },
    38        PUT: {
    39          path: 'configurations/entries/${recordId}', // eslint-disable-line no-template-curly-in-string
    40        },
    41      },
    42    });
    43
    44    constructor(props) {
    45      super(props);
    46      this.changeSetting = this.changeSetting.bind(this);
    47    }
    48
    49    changeSetting(e) {
    50      const value = e.target.value;
    51      this.props.stripes.logger.log('action', `changing preferred '${this.props.pluginType}' plugin to ${value}`);
    52      const record = this.props.data.setting[0];
    53
    54      if (record) {
    55        // Setting has been set previously: replace it
    56        this.props.mutator.recordId.replace(record.id);
    57        record.value = value;
    58        this.props.mutator.setting.PUT(record);
    59      } else {
    60        // No setting: create a new one
    61        this.props.mutator.setting.POST({
    62          module: 'PLUGINS',
    63          config_name: this.props.pluginType,
    64          value,
    65        });
    66      }
    67    }
    68
    69    render() {
    70      const settings = this.props.data.setting || [];
    71      const value = (settings.length === 0) ? '' : settings[0].value;
    72
    73      const options = this.props.plugins.map(p => ({
    74        value: p.module,
    75        label: `${p.displayName} v${p.version}`,
    76      }));
    77
    78      return (
    79        <div>
    80          <b>{this.props.pluginType}</b>
    81          &nbsp;
    82          <Select
    83            id={this.props.pluginType}
    84            placeholder="---"
    85            value={value}
    86            dataOptions={options}
    87            onChange={this.changeSetting}
    88          />
    89        </div>
    90      );
    91    }
    92  }
    93
    94  export default PluginType;
```

## Explanation

Stripes components are written in [ES6](https://github.com/lukehoban/es6features), also known as ECMAScript 6 or (confusingly) ECMAScript 2015. This is a modern dialect of JavaScript that includes numerous new and important features, including classes, `let` and `const`, promises and modules.

Because most Web browsers do not yet support ES6, it must be [transpiled](https://en.wikipedia.org/wiki/Source-to-source_compiler) into old-style JavaScript. This is done by Babel when the Stripes application is built using NPM. (Babel is also responsible for pulling in the correct set of modules that are required by the particular Stripes application.)

The source-code below therefore includes some idioms that will not be familiar to all JavaScript programmers.

### Imports (lines 1-4)

ES6 `import` syntax is used to pull in objects from two other modules. The first is inherent to writing Stripes components; the second provides formatting.

First we import two things from React:
* The `React` object itself, which is needed by [JSX](https://jsx.github.io/), the syntax that allows us to embed HTML/XML directly into JavaScript.
* The `PropTypes` object, which we will later use to declare what properties this component requires.

(Annoyingly, a quirk of NPM and React means that we can't have multiple copies of the React library visible when the application is built, so we have to remove every copy except the one that belongs to `stripes-core`. As a result, running ESLint on the present source file will report that the required library is missing. So we disable the relevant warning for that line, hence the cryptic comment.)

Then we bring in the **Select** component, which will be used to render the drop-down list of available plugins of the appropriate type.

### Definition of class **PluginType** (lines 6-94)

A Stripes component is a special kind of React component. We create it by first creating a React component -- i.e. a class that extends React's `Component` class -- and then having its invoker connect the component.

### Property-type validation (lines 7-27)

React components [may optionally specify what properties they expect to have passed to them](https://facebook.github.io/react/docs/typechecking-with-proptypes.html), by providing a static member called `propTypes` that describes the properties and their types and structures. When this is done, run-time code validates each invocation of the component to ensure that it is correct. We provide property-type validation in this component, although it is rather verbose. This is more useful in general-purpose components that are re-used in many places, such as the **Select** component that we will use from the `stripes-components` library.

In this case, the component expects to be passed:
* [the Stripes object](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md#the-stripes-object), which in this case is used only for logging;
* Data passed in from Stripes Connect;
* Mutators provided by Stripes Connect (see [below](#the-changesetting-handler-function-lines-49-67))
* The name of the plugin-type being configured.
* The set of available plugins of the relevant type.

### The data manifest (lines 29-42)

The data manifest describes the data resources that the component wants to use, and how they are connected to Okapi services (if they
are -- some data may be purely on the client side). Data manifests are described in detail in [The Stripes Connect API documentation](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md)

In this case, two resources are needed. The `recordId` is a local resource that contains the ID of the configuration record responsible for storing the setting of the favoured plugin for the present type. The `setting` is the setting itself, a record that is read from and persisted to Okapi. The WSAPI path where the configuration objects are stored is `configurations/entries`, and new entries are created by POSTing to that path. However, when overwriting an existing configuration record, its full address must be specified, including the recordId. This is done using the syntax `${recordId}`, which the value of the same-named local resource into the PUT path.

### The constructor (lines 44-47)

Handler functions in JavaScript are not correctly bound by default, so that their notion of what `this` is is wrong. For this reason, it's necessary to explicitly bind them to the correct `this`. We do this in the constructor, which is also responsible for ensuring (with `super(props)`) that the constructor of React-component superclass is called.

### The `changeSetting` handler function (lines 49-67)

Handlers are functions that are invoked when the user does something, such as (in this case) change the selected value of a dropdown. They are installed as event handlers with the usual `<htmlElement onClick={handler}>` syntax, though in this case that is
done by the **Select** subcomponent.

Most handlers are simple functions, but this one is more complex than most because it has to deal with two separate situations: if the plugin-type under consideration as yet has no configuration record specifying its favoured plugin, then a new record must be created as POSTed; but if a record already exists, it needs to be modified and PUT. The decision is made on the basis of whether a record was returned in the `data.setting` value provided by Stripes Connect.

In either case, the data is sent using the _mutator_ for the `setting` resource. As described in [the Stripes Connect API documentation](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md), a mutator is an object, provided by stripes-connect, which maps each of the HTTP method names (GET, POST, PUT, DELETE) to a function that implements that method for the relevant resource.

### Rendering the component (lines 69-91)

As with most React components, the `render` method is at the heart of how it works. Unlike the handler function `changeSetting`, which we wired into the form, `render` is called by React itself: it is one of the React ["lifecycle methods"](https://facebook.github.io/react/docs/component-specs.html). Its job is simply to return an HTML element to be rendered: often, as in this case, that element will contain other React components, which will in turn be rendered.

The first thing this renderer does (lines 70-71) is extract information from the React properties to determine whether there is an existing configured preference for which plugin to use for the present type.

Then it constructs the set of options that will be available in the dropdown (lines 73-76).

Finally, lines 78-90 return the rendered HTML, which in this case is a **div** containing a plugin-type label and [a **Select** subcomponent](https://github.com/folio-org/stripes-components/blob/master/lib/Select/Select.js). The set of options, the present value, and the change-handler function are all passed into **Select**.

### Exporting the component (line 94)

At this point, **PluginType** is a connected React component. We export it as the default export of the JavaScript module. It will be imported and connected by a higher-level module, using code similar to:

```
import PluginType from './PluginType';
// ...
this.connectedPluginType = props.stripes.connect(PluginType);
// ...
<this.connectedPluginType pluginType={type} plugins={pluginTypes[type]} />
```

## Summary

Creating a Stripes component consists of creating a React component
that knows how to render the relevant data, and wrapping the result
with `stripes-connect` to connect its data resources to persistence
services (usually Okapi).

The code for doing this is rather dense, because a lot of concepts are
involved. But it can be quite short, and the more complex code can be
seen as mostly consisting of easily learned idioms.


