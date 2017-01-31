# A component example: the **PatronEdit** component

<!-- ../../okapi/doc/md2toc -l 2 component-example.md -->
* [Introduction](#introduction)
* [Source code](#source-code)
* [Explanation](#explanation)
    * [Imports (lines 1-4)](#imports-lines-1-4)
    * [Definition of class **PatronEdit** (lines 7-41)](#definition-of-class-patronedit-lines-7-41)
    * [The data manifest (lines 10-14)](#the-data-manifest-lines-10-14)
    * [Making the router available (lines 16-18)](#making-the-router-available-lines-16-18)
    * [Handler functions (lines 22-29)](#handler-functions-lines-22-29)
        * [`updatePatron()` (lines 22-25)](#updatepatron-lines-22-25)
        * [`cancel()` (lines 27-29)](#cancel-lines-27-29)
    * [Rendering the edit form (lines 31-41)](#rendering-the-edit-form-lines-31-41)
    * [Connecting the component (line 44)](#connecting-the-component-line-44)
* [Summary](#summary)

## Introduction

The **PatronEdit** component is defined in the source file
[`patrons/PatronEdit.js`](../../patrons/PatronEdit.js).
As is conventional, the filename is the same as that of the component.

The **PatronEdit** source code is quite short (44 lines including
blanks and comments). This is achieved by including the **PatronForm**
component from its own 400-line file, which is also used by
**PatronAdd**. Despite its length, **PatronForm** is very simple:
essentially all it does is create an HTML form wired into Redux's
form-handling machinery. Crucially, it is not a
[connected component](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md#introduction),
so it uses no Stripes machinery: it is pure React.

**PatronEdit** itself _is_ a connected component, and serves as a
simple example for how to create such components. This document will
walk through the source code and explain each section.


## Source code

This is the code as of git commit
[f00edbd46df003bd27b7da2989a42079bad5e2f3](https://github.com/folio-org/stripes-experiments/blob/f00edbd46df003bd27b7da2989a42079bad5e2f3/patrons/PatronEdit.js).

```
     1	import React, { Component, PropTypes } from 'react';
     2	import { connect } from 'stripes-connect';
     3	import PatronForm from './PatronForm';
     4	import { actionTypes } from './PatronForm';
     5	
     6	// One of multiple stripes-connected components in the patrons module
     7	class PatronEdit extends Component {
     8	
     9	  // The manifest is provided in components by the module developer and consumed by 'stripes connect'
    10	  static manifest = { 'patrons': { type: 'okapi',
    11	                                   pk: '_id',  // The primary key of records from this end-point
    12	                                               //  (when it's not the default, "id")
    13	                                   path: 'apis/patrons/:patronid' // request parameter, provided by router
    14	                                 }};
    15	
    16	  static contextTypes = {
    17	    router: PropTypes.object.isRequired
    18	  };
    19	
    20	  // Invokes the mutator provided by stripes connect to perform a PUT
    21	  // Uses router object to navigate back to list
    22	  updatePatron(data) {
    23	    this.props.mutator['patrons'].PUT(data);
    24	    this.context.router.push('/patrons/list');
    25	  }
    26	
    27	  cancel(data) {
    28	    this.context.router.push('/patrons/list');
    29	  }
    30	
    31	  render() { 
    32	      const { data: { patrons }, params: { patronid } } = this.props;
    33	
    34	      let patron = patrons.find((patron) =>  { return patron._id === patronid });
    35	
    36	      return <PatronForm onSubmit={this.updatePatron.bind(this)} 
    37	        cancelForm={this.cancel.bind(this)}
    38	        action={actionTypes['update']}
    39	        initialValues={patron} />
    40	  }
    41	}
    42	
    43	// This function call might be implicit in a future version (invoked by the framework)
    44	export default connect(PatronEdit, 'patrons');
```

## Explanation

Stripes components are written in
[ES6](https://github.com/lukehoban/es6features),
also known as ECMAScript 6 or (confusingly) ECMAScript 2015. This is a
modern dialect of JavaScript that includes numerous new and important
features, including classes, `let` and `const`, promises and modules.

Because most Web browsers do not yet support ES6, it must be
[transpiled](https://en.wikipedia.org/wiki/Source-to-source_compiler)
into old-style JavaScript. This is done by Babel when the Stripes
application is built using NPM. (Babel is also responsible for pulling
in the correct set of modules that are required by the particular
Stripes application.)

The source-code below therefore includes some idioms that will not be
familiar to all JavaScript programmers.

### Imports (lines 1-4)

ES6 `import` syntax is used to pull in objects from four other
modules. The first two are inherent to writing Stripes components; the
second two are related to the use of the **PatronForm** component to
render the elements of the HTML form.

First we import three things from from React:
* The `React` object itself, which is needed by
  [JSX](https://jsx.github.io/),
  the syntax that allows us to embed HTML/XML directly into JavaScript.
* The `Component` class, so that we can extend
  it when we define our own component.
* The `PropTypes` object, which we will later use to make the router
  available.

Next, we import the `connect` method from Stripes Connect. We will use
this at the very end of the file, to turn our React component into a
Stripes component by connecting it to Okapi.

We bring in the **PatronForm** component, along with the `actionTypes`
object which we will later use to specify that this component is
updating an existing patron rather than creating a new one.

### Definition of class **PatronEdit** (lines 7-41)

A Stripes component is a special kind of React component. We create it
by first creating a React component -- i.e. a class that extends
React's `Component` class -- and then upgrading it to a Stripes
component by calling `connect()` at the end.

### The data manifest (lines 10-14)

The data manifest describes the data resources that the component
wants to use, and how they are connected to Okapi services (if they
are -- some data may be purely on the client side.) Data manifests are
described in detail in [The Stripes Connect API
documentation](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md)

In this case, only a single resource is needed: `patrons`. This is
connected to Okapi; the primary key of the records is `_id` (rather
then the default `id`); and a record whose ID is _patronid_ can be
found at the path `apis/patrons/`_patronid_, relative to the base URL
of the Okapi service.

> **ISSUE.** Why is the primary key different from the default? The
> patrons API of the Circulation module should use `id` unless there
> is a compelling reason not to.

### Making the router available (lines 16-18)

The handler functions will navigate to different URLs, using the
router object to do this. In order for them to be able to do so, React
must be instructed to make the router visible as part of the
[React context](https://facebook.github.io/react/docs/context.html).
This is done by setting the special `contextTypes` class variable to
an object whose keys are the names of the elements to expose in the
context. The corresponding value must be `PropTypes.object.isRequired`.

### Handler functions (lines 22-29)

These are functions that are invoked when the user does
something. They are installed as event handlers with the usual
`<htmlElement onClick={handler}>` syntax, though in this case that is
done by the **PatronForm** subcomponent. Note that the handler
functions, bound to `this`, are passed in when that subcomponent is
invoked below.

#### `updatePatron()` (lines 22-25)

This handler is called when the patron form is submitted. It does two
things.

1. It sends the actual data that the user has entered in the form
   through to the persistence mechanism (Okapi in this case). It does
   this using the _mutator_ for the `patrons` resource. As described
   in
   [the Stripes Connect API documentation](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md),
   a mutator is an object, provided by stripes-connect, which maps
   each of the HTTP method names (GET, POST, PUT, DELETE) to a
   function that implements that method for the relevant resource.

2. It redirects the URL to one that the router will interpret
   appropriately for the session to continue -- in this case, the
   patron list at `/patrons/list`. It does this by pushing the new
   path into the stack maintained by the router. (This is why we
   earlier used `contextTypes` to make the router available.)

> **ISSUE.** The syntax `this.props.mutator['patrons'].PUT(data)` is
> explicit but ugly. Could we easily provide HTTP method verbs on
> `this` so that module authors can just write
> `this.PUT('patrons', data)`?

#### `cancel()` (lines 27-29)

This handler is simpler, as it is called when the user decides not to
edit the patron after all. It has nothing to do but redirect the
application to the patron list.

### Rendering the edit form (lines 31-41)

As with most React components, the `render()` method is at the heart
of how it works. Unlike the handler functions `updatePatron()` and
`cancel()`, which we wired into the patron-editing form, `render()` is
called by React itself: it is one of the React
["lifecycle methods"](https://facebook.github.io/react/docs/component-specs.html).
Its job is simply to return an HTML element to be rendered: often, as
in this case, that element will be another React component, which will
in turn be rendered.

The first thing this renderer does is extract information from the
React properties using
[destructuring assignment](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).
The single line 32 is equivalent to:

```
const patrons = this.props.data.patrons;
const patronid = this.props.params.patronid;
```

The name of the data element `patrons` is taken from the data
manifest. It is an array containing a set of patron methods.

If **PatronEdit** were the only component to include `patrons` in its
manifest, then it would be safe to assume that the only element of the
list would be the patron identified by the `:patronid` element in the
URL path. However, other components may also use the same resource:
for example, **PatronList** populates it with multiple records.

For this reason, it is necessary to pick out the correct relevant
record to display as part of the edit form. This is done by line 34,
which uses
[the standard array method `find()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
to pick out the element whose `_id` field matches the `patronid` we
earlier extracted from the parameters.

Finally, lines 36-39 return the rendered HTML, which in this case is
an invocation of the **PatronForm** React component that we imported
at the top of this source file. That component is defined to take
several parameters:

* `onSubmit` and `cancelForm` indicate which handler functions to
  use when the form is submitted or cancelled.
* `action` is a small package of configuration appropriate for either
  adding a new patron or editing an existing one: it must be one of
  the values from the `actionTypes` object that we imported from
  **PatronForm**.
* `initialValues` is an object containing the data of the existing
  patron record, which is used to prepopulate the form.

### Connecting the component (line 44)

At this point, **PatronEdit** is a React component. But instead of
exporting this, we wrap it using the `connect()` method provided by
the `stripes-connect` module and export the resulting connected
component. (The second parameter passed to `connect()` must be the
name of the Stripes module that the component is a part of.)

## Summary

Creating a Stripes component consists of creating a React component
that knows how to render the relevant data, and wrapping the result
with `stripes-connect` to connect its data resources to persistence
services (usually Okapi).

The code for doing this is rather dense, because a lot of concepts are
involved. But it can be quite short, and the more complex code can be
seen as mostly consisting of easily learned idioms.


