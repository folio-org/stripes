# A component hierarchy example: the `patrons` module

## Introduction

Building a Stripes application consists of plugging Stripes modules together. Creating modules is the core development activity in Stripes: most UI developers will spend most of their time putting together modules that provide an interface to some functionality provided on the server-side.

Stripes modules are composed of components. Stripes components are [React](https://facebook.github.io/react/) components, wrapped in some additional functionality. Most importantly, a _connected component_ is one that uses the services of the stripes-connect library to connect it to data -- most usually, data maintained via an Okapi-mediated FOLIO module, but potentially also other RESTful web-services or even purely local (non-persistent) data.

This document illustrates how components can work together as a module: in particular, it discusses how the components of a hypothetical `patrons` fullpage module that support search and display of patron records and associated data such as holds and loans.

Module names are written in all lower-case, with words separated by hyphens and set in code font `like-this`. Component names are written in CamelCase and set in bold, **LikeThis**.

<!-- ../../okapi/doc/md2toc -l 2 component-hierarchy.md -->
* [Introduction](#introduction)
* [The module](#the-module)
    * [Metadata describing the module](#metadata-describing-the-module)
    * [State within the module](#state-within-the-module)
* [Components](#components)
    * [Patrons](#patrons)
    * [TopBar](#topbar)
        * [SearchBox](#searchbox)
            * [SearchSettings](#searchsettings)
    * [PatronRouter](#patronrouter)
    * [SearchResults](#searchresults)
        * [SearchResult](#searchresult)
    * [Display](#display)
        * [Holds](#holds)
            * [HoldBrief](#holdbrief)
                * [ItemBrief](#itembrief)
        * [Loans](#loans)
            * [LoanBrief](#loanbrief)
        * [Blocks](#blocks)
* [Appendix: additional issues to be discussed](#appendix-additional-issues-to-be-discussed)




## The module


### Metadata describing the module

Each Stripes module is described by metadata -- some of it affecting
how it functions, some merely descriptive. For a `patrons` module, the
metadata might look like this:

```
{
  'name': 'Patrons',      // Human-readable caption used for menus, etc.
  'type': 'fullpage',     // As opposed to "menubar", “popup”, etc.
  'route': '/patrons',    // The module runs when a URL ending with this path is used
  'component': 'Patrons'  // Name of the top-level component loaded for the specified route
}
```

The metadata of the various modules making up a Stripes application is
aggregated by stripes-config-plugin. (Code-loading is handled asynchronously
so that a module's code is sent to the browser when visiting a
route that uses it.)


### State within the module

Each stripes module maintains all of its state in a single pool. (See
[**How state is stored**](https://github.com/folio-org/stripes-connect/blob/master/doc/api.md#appendix-a-how-state-is-stored)
for details).
Each piece of state has a name, and may be accessed by multiple
components. Often, only one component will be responsible for making
changes to a given piece of state, while others only inspect it. In
this case, we might say that the first component "owns" that piece of
state. In the descriptions that follow, we will note which pieces of
state the components of a `patrons` module might access, and the mode of access
(**C** = create,
**R** = read,
**U** = update,
**D** = delete).

State may be persisted to a RESTful service (most often, Okapi, the
FOLIO API gateway) or it may be held locally, within the browser
session. Below, we will refer to the former as Okapi data and the
latter as local state.


## Components

All the components described here are "local", i.e. part of this
module. It may also be possible to use components from other modules
-- most importantly, from utility modules that act as a library of
re-usable components. The mechanisms for doing this have yet to be
specified.

Since components like ItemBrief (see [below](#itembrief)) are short
and straightforward, it may be cleaner to design such display
components repeatedly in the context of different modules, so as to best
fit them to the part of the UI where they are used; or it may prove
better to have a component library provide a one-size-fits-all
brief-display component than can be parameterised or subclassed to
display items, patrons, or other kinds of data, and then reused in
disparate modules. Something like an autocompleting search-box will
likely use something from the component library, or even from a
standalone `stripes-searchbox` module repo.

Note that in the structural overview of the `patrons` module that
follows, Overdues and Fines are omitted, as they are implemented in
essentially the same way as Holds and Loans.

We now consider the individual components in turn, starting with
high-level components and working down.


### Patrons

As specified in the module metadata (see above), this is the module's
root component, used when the URL's path begins with the
`/patrons` route. Its sole purpose is to display the top bar and
delegate the main area underneath of the patron router.

* Okapi data: none
* Local state: none
* Child components: **TopBar**, **PatronRouter**

### TopBar

A bar that goes across the top of the content area for the whole
`patron` module, linking to various functionality and containing a
search box to find particular patrons. Since this is a sibling of
**PatronRouter**, it is rendered along with whichever of that router's
sub-components is selected.

* Okapi data: none
* Local state: none
* Child components: **SearchBox**; perhaps also some Links or whatever
  the component library gives us that we'd use to link within the
  module

#### SearchBox

The search box on the **TopBar**. It has a gear symbol beside it
("settings") that drops out a **SearchSettings** panel which is not
displayed until that symbol is clicked. Submitting the form redirects
to a route that includes `search/:query`, resulting in the
**SearchResults** component being displayed by the router.

* Okapi data: search completions past three characters
* Local state: search settings (per-page, sort order, etc.) (R), recent
  searches (prioritised in the completions)
* Child components: **SearchSettings**

> **ISSUE.** How do we arrange for the **SearchSettings** panel to be
> displayed only when the gear symbol is clicked?

##### SearchSettings

Settings for patron search, such as how to sort the search results,
how many results to show on each page, which fields to include in the
search, etc.

* Okapi data: none
* Local state: search settings (per-page, sort order, etc.) (CRUD)
* Child components: various controls

> **ISSUE.** How do we arrange for the **SearchSettings** panel to be
> floated above other content? Where is this display characteristic
> specified?

### PatronRouter

A react-router component that manages the routing for URL fragments
*below* `/patrons`. Module authors have some flexibility in how they
build this. In a simple module, perhaps there are no additional routes;
a fairly complex module might just use the simple JSX syntax; and a
more complex one might organise the code however is convenient to the
team maintaining it -- perhaps including additional code
splitting/asynchronous loading.

> **ISSUE.** We still need to determine whether react-router 4.x
> allows us to nest routes.

Here are the routes the patron router will export, and the components
they map to:

* `:id` -- Display the record whose ID is provided. Uses the
  **Display** component.
* `add` -- Add a new record.
* `edit/:id` -- Edit the record whose ID is provided.
* `search/:query` -- Run the specified query. Displays the
  **SearchResults** component when the search result is returned from
  the server.

> **ISSUE.** Can we make the router distinguish routes containing IDs
> (matching) `:id` from those containing literal `add` and `edit`?

> **ISSUE.** When searching, should additional relevant parameters,
> such as start-record and the number of records to display, be held
> only in local state? Or should they be included in the route? If so,
> would it be better to use the URL’s query parameters or the
> fragment?

> **ISSUE.** How do route parameters (whether in the URL query or
> fragment) interact with additional parts of the path?  For example,
> suppose `/patrons/search/john+doe/45` is a search for John Doe,
> displaying the 45th hit in the right pane. We might wish
> `/patrons/search/john+doe/45?sort=name` to be a sorted search,
> displaying the 45th hit in the sorted list. But the **sort=name**
> applies to the **john+doe**, not the **45**. This feels awkward. It
> gets even more complex: inside the **PatronDetail** component we
> might have a link to add a loan. A relative link to **addBlock**
> would work differently depending on the structure of the URL. There
> is much to discuss here.

> **ISSUE.** How do components determine the correct route to redirect
> to, for example after submitting an edit?

### SearchResults

(Note the plural name of this component.)

This result list displays many individual results together.

* Okapi data: patrons matching the query in the route, according to
  `?params` (sort-order, etc.)
* Local state: none
* Child components: many instances of **SearchResult**; some controls to
  enable batch operations.

> **ISSUE.** The batch-operation controls will need mutators for the
> associated data.

This component may pull more matches from the server than it displays
on the page: downloading a few hundred matches is faster than
displaying them, so it's possible to out-fetch the pagination and have
records ready in advance so that scrolling the list and moving onto the
next page can be very fast. That part will leverage something from our
component library for the list display, perhaps using
[react-virtualized](https://bvaughn.github.io/react-virtualized/).

> **ISSUE.** How does the windowed list view fetch additional records?
> How can we consume that component from the library? Perhaps a
> callback?

#### SearchResult

(Note the singular name of this component.)

Displays a single patron. The fields themselves are passed in as React
component properties. Controls are provided for viewing the full
record, editing and deleting. There is also "selected" checkbox for
batch operations.

* Okapi data: none
* Local state: toggle state indicating which records are to be
  affected by batch operations
* Child components: perhaps controls for the record operations

### Display

This displays a patron's profile in detail, as opposed to the summary
displayed by the **SearchResult** component.

* Okapi data: detailed patron record for **:id** (R),
  their associated item records
* Local state: none
* Child components: **Holds**, **Loans**, **Blocks** (and **Overdues**
  and **Fines**, but we don't discuss them here)

#### Holds

This component is part of the patron display and styled to fit
therein. It contains a list of the items that the patron has on hold,
along with a control to add new holds.

* Okapi data: Holds for this patron (CRD), associated items (R)
* Local state: probably none
* Child components: **HoldBrief**

> **ISSUE.** Do we need to support pagination of holds? Do people have
> that many holds? We can probably pull the whole list but use a
> control to display a subset with a scrollbar.

> **ISSUE.** We'll need the title from the Item record but do we need
> anything from the Holdings here? Maybe the barcode number of the
> specific instance?

##### HoldBrief

Used to render a hold passed in through properties. This component
must be passed a reference to the mutator too, so that it can have
a button to delete them.

* Okapi data: none
* Local state: none
* Child components: **ItemBrief**

###### ItemBrief

Renders the item title for use in **HoldBrief** and also **LoanBrief**
(see below); perhaps other information can also usefully be rendered,
such as the author and date.

* Okapi data: none
* Local state: none
* Child components: none

#### Loans

Renders a read-only list of this patron's loans.

* Okapi data: loans for this patron (R)
* Local state: none
* Child components: **LoanBrief**

> **ISSUE.** Is read-only access enough? Perhaps we would want to be
> able to renew a user's loans from here? But checking items back in
> is presumably done somewhere else: it's not necessary to have first
> found the patron before doing this.

##### LoanBrief

Used to render a loan passed in through properties.

* Okapi data: none
* Local state: none
* Child components: **ItemBrief** (see above)

#### Blocks

Renders the blocks placed on the patron.

* Okapi data: Blocks (CRUD)
* Local state: none
* Child components: none

## Appendix: additional issues to be discussed

> **ISSUE.** The components may need to display different fields and
> controls -- which in some cases will be sub-components -- depending
> on the permissions of the logged-in user. For example, a user may or
> may not be authorised to extend a patron's loans.

> **ISSUE.** The components may need to behave differently depending
> on what modules are enabled elsewhere: for example, holds and loans
> can only be displayed if the back-end Circulation module is
> enabled. How do we do this service discovery? (Libraries that don't
> circulate still have patrons, so this is a real scenario.)

> **ISSUE.** How will we do validation? In part, this should be driven
> by the JSON schemas available to the server, but leaving it to the
> server to do validation results in an unresponsive UI, so will
> probably want a mechanism for the UI to get hold of these schemas
> and do what validation can be done on the client side. (Additional
> server-side validation will also likely be needed, by reference to
> data that the UI may not have, or be able to efficiently obtain. For
> example, it can check whether a branch name is valid for the
> present library.)

> **ISSUE.** Where does configuration live? Maybe the `patron` module
> has some settings, such as default sort order, that users can
> persist to a service? Would that service be Okapi? Perhaps the
> tenant administrator can configure the defaults on a tenant-wide
> basis?

> **ISSUE.** How can extension modules extend the data model for
> underlying modules?  For example, consider a `patron-demographics`
> that might add sex, ethnicity and religion fields to the patron
> record. Can we come up with a mechanism for augmenting the existing
> patron records with these additional fields, and surface them in the
> UI module?

> **ISSUE.** Might patrons and users potentially be the same entity?
> If so then we'll need to add more sophisticated permissions, groups
> and suchlike.

> **ISSUE.** We still need to decide what the URLs are going to look
> like for this system, especially when using the three-pane layout
> where the state has both a search and a record, potentially with
> parameters for both aspects. This only gets more complicated if we
> then implement Filip's split-screen mode.

> **ISSUE.** We aim to have a collection of generic, reusable base
> components -- for example, controls that allow a module author to
> build the multiple panes of the Finder-like design that Filip is
> using for the UI prototype. We may also need to provide the ability
> to invoke component sets as frameworks that we can embed specific
> components inside -- so for example we can invoke **ThreePaneSetup**
> in a form where it "calls back" to a component we specify, such as
> a modified form of **PatronRouter**.

