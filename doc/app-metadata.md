# Stripes application metadata bundles

<!-- md2toc -l 2 app-metadata.md -->
* [Background](#background)
* [Specification](#specification)
    * [Standard fields (top level)](#standard-fields-top-level)
    * [Extensions](#extensions)
    * [Welcome-page entries](#welcome-page-entries)
    * [Icons](#icons)
* [Example](#example)


## Background

As discussed in [STCOR-117](https://issues.folio.org/browse/STCOR-117), there is a need to capture application-level metadata about the various Stripes applications -- Users, Inventory, Codex Search, etc. This includes both human-readable texts such as the full and short titles, and machine-readable files such as icons.

Since some of the metadata elements that need to be specified are already present in the application modules' [NPM package files](https://docs.npmjs.com/files/package.json), it was decided to keep all of the elements in that file, rather than duplicating information. This approach also makes it easy for application code, and for Stripes itself, to access the metadata. The extension fields are all contained within the `stripes` section of the package file.


## Specification

In the tables that follow, "Field" is the human-readable name of the metadata
field as provided by Filip Jakobsen, and "Location" is the formal name
of that field within the package file.

### Standard fields (top level)

Apart from `stripes`, the sub-record that contains the extension fields, all of the fields at the top level of the NPM package file are standard fields interpreted in the standard way. The **[Ref]** links provide the NPM package-file documentation for the fields.

Field | Location | Description and notes
:---- | :------- | :--------------------
Name | `name` | The module name: a unique identifier, usually prefixed with `@folio/`. [**[Ref]**](https://docs.npmjs.com/files/package.json#name)
Version | `version` | The current version of the module, expressed as three-faceted number, _major_._minor_._patch_, such as. "1.1.0". [**[Ref]**](https://docs.npmjs.com/files/package.json#version)
Description | `description` | A one sentence description of what the app does. [**[Ref]**](https://docs.npmjs.com/files/package.json#description-1)
License | `license` | A short statement of the software licence, chosen from [the SPDX controlled list](https://spdx.org/licenses/) -- for example, "Apache-2.0". [**[Ref]**](https://docs.npmjs.com/files/package.json#license)
Feedback | `bugs` | Information on how to give feedback on the application, including but not limited to bug-reports. See below for details. [**[Ref]**](https://docs.npmjs.com/files/package.json#bugs)
Extensions | `stripes` | Information specific to Stripes applications, not applicable to other NPM packages. See [below](#extensions).

The `bugs` field is a structure containing two subfields:

Field | Location | Description and notes
:---- | :------- | :--------------------
Feedback URL | `bugs.url` | "https://issues.folio.org/projects/UISE"
Feedback email | `bugs.email` | "mike@indexdata.com"

### Extensions

The `stripes` structure contains the following extension fields:

Field | Location | Description and notes
:---- | :------- | :--------------------
Type | `type` | The type of the module: may be `app` for a regular full-page application, `popover` for an application that can run in popover mode as well as in regular full-page mode, or `settings` for modules that only provide an entry in the Settings page.
Short title | `displayName` | This is needed in the header, where, based on user preference or screen size, the names of the apps may be displayed next to their icons.
Full title | `fullName` | The full title of the application: for example, when this is "Library Yearly Calendar", the short title might be just "Calendar".
Default popover size | `defaultPopoverSize` | For applications that can run in popover mode as well as in full-screen, specifies how wide the popover should be when it first appears (subject to subsequent resizing by the user). May be specified as a percentage (e.g. `40%`) or as a pixel width (e.g. `300px`).
Default preview width | `defaultPreviewWidth` | Specifies how wide the preview pane should be when it first appears (subject to subsequent resizing by the user). May be specified as a percentage (e.g. `40%`) or as a pixel width (e.g. `300px`).
Help page | `helpPage` | The URL of a page that is helpful in understanding the application. This may point to a Help app within Stripes itself, or to some outside resource such as https://wiki.folio.org/pages/viewpage.action?pageId=1415393
Icons | `icons` | A list of zero or more icons provided and used by the application. See [below](#icons) for details.
Welcome-page entries | `welcomePageEntries` | A list of zero or more icon-and-text entries on the welcome page. See [below](#welcome-page-entries) for details.

### Welcome-page entries

The `welcomePageEntries` field specifies a set of paragraphs on the application's welcome page (see [mock-up](https://issues.folio.org/secure/attachment/11010/Screenshot%202017-12-05%2023.59.26.png)). It is represented by an array of structures, each of them containing three subfields:

Field | Location | Description and notes
:---- | :------- | :--------------------
Icon name | `iconName` | The name of an icon provided either by Stripes itself or by the application. This will be a short string such as `"happyFace"` rather than the path to a specific file. Typically the name will be one of those defined in the `icons` section (see [below](#icons)).
Headline | `headline` | "Search local inventory and e-resources together!",
Description | `description` | "The Codex Search application lets you search across multiple sources ..."

### Icons

The `icons` field specifies metadata for a set of icons that are used by the application: the actual images are provided in their own files. Each icon's metadata contains four subfields:

Field | Location | Description and notes
:---- | :------- | :--------------------
Name | `name` | A short name that uniquely identifies the icon within the application, such as `"kb"` or `"edit"`.
Filename | `fileName` | The basename of a set of files representing the icon. See below for details of how this is interpreted.
Alt | `alt` | A string to be used as alt-text when an icon-image is rendered -- for example, to be read out loud by a screen-reader.
Title | `title` | An image title that pops up if you hover over the icon.
Src | `n/a` | The icon's full path generated at build time.

Client code will refer to an icon by a nested property consisting of application-name (from `name` at the top level, above), followed by `icons`, the icon name (`name`), and then `src` -- for example, `'users.icons.edit.src'`, `'users.icons.cancel.src'` or `'core.icons.cancel.src'`. Grouping icons by application name makes it unnecessary to insist on global uniqueness of icon names.

Icon variants for high and low-resolution use-cases, are accessible via `high.src` and `low.src` properties within the icons name.  The `high` and `low` variants each map to `icons/[fileName].svg` and `icons/[fileName].png` respectively. Additional variants can be specified as the need arises.  The default variant, `high`, and is accessible directly via `src`.  Therefore, `users.icons.app.src` is the equivalent to `users.icons.app.high.src`.

The icon-name `app` is special, and is used as the application's own icon (e.g. in the applications bar at the top of the Stripes window).

The icon-name `popover` is also special: for applications such as Notes and Notifications which can appear in popover mode, the icon of this name is used for the button used to invoke the popover.

> **Note.** At present, both Notes and Notifications are not true modules, but facilities provided by stripes-core. In future, they will be moved out of stripes-core and become modules in their own right, capable of functioning both in full-screen mode (like a regular app) or popover mode.

An application must provide icon files for each icon that it declares in its metadata. Icon files are placed in the `icons` directory in the top level of the application's directory structure. Each icon must be provided in two forms:

* 14x14 PNG file
* 24x24 vector SVG file

Icon files must be named according to the `fileName` element of the metadata record, with `.png` and `.svg` extensions for the two forms of the file. For example, an icon whose `name` is `edit` but whose `fileName` is `editUser` must be provided as `editUser.png` and `editUser.svg` files in the top-level `icons` directory. (Icon designers do not need to provide rounded corners: this is done in CSS.)


## Example

The following is the package file from the Codex Search application,
with the irrelevant technical entries removed. The parts of the file
shown here should allow all application-level metadata to be recorded.
```
{
  "name": "@folio/search",
  "version": "1.1.0",
  "description": "Search across the Codex",
  "license": "Apache-2.0",
  "bugs": {
    "url": "https://issues.folio.org/projects/UISE",
    "email": "mike@indexdata.com"
  },
  "stripes": {
    "type": "app",
    "displayName": "Codex Search",
    "fullName": "Codex Search",
    "defaultPopoverSize": "400px",
    "defaultPreviewWidth": "40%",
    "helpPage": "https://wiki.folio.org/pages/viewpage.action?pageId=1415393",
    "icons": [
      {
        "name": "local-source",
        "alt": "local inventory",
        "title": "a local source of items that can be checked out"
      },
      {
        "name": "kb",
        "fileName": "generic",
        "alt": "knowledge base",
        "title": "a knowledge base of e-resources available for viewing"
      }
    ],
    "welcomePageEntries": [
      {
        "iconName": "happyFace",
        "headline": "Search local inventory and e-resources together!",
        "description": "The Codex Search application lets you search across multiple sources ..."
      },
      {
        "iconName": "exclamation",
        "headline": "This is a technology preview",
        "description": "The present version of this application is incomplete ..."
      }
    ],
    "libraryCredits": "This application is made possible by ..."
  }
}
```

The above example will generate the following metadata:
```
{
  search: { 
    name: 'search',
    version: '1.1.0',
    description: 'Search across the Codex',
    license: 'Apache-2.0',
    feedback: {
      url: 'https://issues.folio.org/projects/UISE',
      email: 'mike@indexdata.com'
    },
    type: 'app',
    shortTitle: 'Codex Search',
    fullTitle: 'Codex Search',
    defaultPopoverSize: '400px',
    defaultPreviewWidth: '40%',
    helpPage: 'https://wiki.folio.org/pages/viewpage.action?pageId=1415393',
    icons: {
      'local-source': {
        alt: 'local inventory',
        title: 'a local source of items that can be checked out',
        src: '/path/to/@folio/search/icons/local-source.svg',
        high: {
          src: '/path/to/@folio/search/icons/local-source.svg',
        },
        low: {
          src: '/path/to/@folio/search/icons/local-source.png',
        }
      },
      kb: {
        alt: 'knowledge base',
        title: 'a knowledge base of e-resources available for viewing',
        src: '/path/to/@folio/search/icons/generic.svg',
        high: {
          src: '/path/to/@folio/search/icons/generic.svg',
        },
        low: {
          src: '/path/to/@folio/search/icons/generic.png',
        }
      }
    },
    welcomePageEntries: [{
      iconName: 'happyFace',
      headline: 'Search local inventory and e-resources together!',
      description: 'The Codex Search application lets you search across multiple sources of physical and electronic resources ina unified way',
    }, {
      iconName: 'exclamation',
      headline: 'This is a technology preview',
      description: 'The present version of this application is incomplete, and will subsequently be expanded in a number of ways.',
    }]
  }
}
```