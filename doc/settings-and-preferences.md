# Settings and Preferences

This document lays out requirements for settings and preferences, as discussed in [UIP-1](https://issues.folio.org/browse/UIP-1), and proposes how Stripes should support them. These concepts are similar but distinct, and properly supporting both will require changes to the Stripes core.


## Table of contents

<!-- md2toc -l 2 -s 1 settings-and-preferences.md -->
* [Tenant-level and user-level configuration](#tenant-level-and-user-level-configuration)
    * [Tenant defaults for user preferences](#tenant-defaults-for-user-preferences)
* [UX concerns](#ux-concerns)
* [Software requirements](#software-requirements)
    * [How should a module supply a preferences component?](#how-should-a-module-supply-a-preferences-component)
* [Changes to existing modules](#changes-to-existing-modules)
* [Architectural considerations](#architectural-considerations)
    * [Multiple module types](#multiple-module-types)
    * [Settings and Preferences as actual modules](#settings-and-preferences-as-actual-modules)


## Tenant-level and user-level configuration

Stripes provides means for users to configure FOLIO. Such configuration can be either global across an entire tenant, or local to specific user.

* _Settings_ refer to tenant-level configuration, such as the loan policies in use, the resource-types available for cataloging, and the patron groups to which users can belong.

* _Preferences_ refer to user-level configuration, such as the avatar to be displayed, notification preferences, and the password in use.

* We use _configuration_ as a general term that encompasses both settings and preferences.

In many cases, the two levels of configuration are disjoint: there is no such thing as a user-level preference for which loan policies are in user, or a tenant-level setting of a user's avatar.

However, some configuration makes sense at both levels: for example, consider the choice of localization. A university in Texas may set the locale to `en-US` (English, United States), since it is primarily Anglophone; but many individual users may be primarily Spanish-speaking, and will want to set a user-level preference for the `es` locale. In such cases, the user-level preference should always override the tenant-level setting.

### Tenant defaults for user preferences

Many institutions will want to prepare the default preferences of users before the users first log in. The simplest way to do, both from implementation and UX perspectives, is to have a special user called “Default Preferences” or similar, which administrators can log in as, and set the preferences as desired. Whenever a new user is created, the initial set of preferences would be copied from this user. Note, then, that default preferences really are preferences rather than settings -- even though they are in some sense a property of the tenant.


## UX concerns

For configuration that exists at both levels, such as locale selection, one possible approach to the UX would be to have a single page for configuration, but enabling that page to affect either the tenant-level setting or the user-level preference.

We will _not_ pursue this approach. First, because initial analysis suggests that it will pertain to relatively few configuration items: most are either tenant- or user-level but not both. And second, because even when  a configuration item does make sense at both levels, we will often want to present it differently at the two levels: for example, the page for changing tenant-level locale will likely include a warning and an "Are you sure?" verification, both of which are unnecessary at the user level.

Instead, we will introduce a new top-level icon for Preferences, analogous to that for Settings; and clicking it will take the user to a page similar to the existing Settings page, with sections for each module that contributes a preferences component.


## Software requirements

The only immediate requirement on the part of Stripes modules is that they be able to supply a preferences component, much as they presently have the option of supplying a settings component. Some modules will supply settings, some will supply preferences, some will supply both and some will supply neither.

Much code will likely be shared between the existing settings components and the new preferences components -- in particular, [the `<Settings>` component from stripes-smart-components](https://github.com/folio-org/stripes-smart-components/tree/master/lib/Settings), though this will need minor tweaking: it presently includes the hardwired caption "Module Settings" and the hardwired path `/settings`, both of which will need to be modified when used in a preferences context.

Stripes-core will need extending to pick up preferences components from the modules it loads, as well as settings components, and to furnish a top-level preferences page. Again, much code will likely be re-used from the existing settings support.

### How should a module supply a preferences component?

At present, Stripes modules export a single component. This component is used as the main-page application; but when stripes-core needs the module's settings it renders the same component with the `showSettings` property set true. The top-level component then delegates to the settings component, as for example in [this code from the Users app](https://github.com/folio-org/ui-users/blob/b2fd005df27f58630c4b0651729b719b1fd33e0b/index.js#L36-L38).

The simplest way to extend this schema to support a preferences component would be to have stripes-core pass an analogous `showPreferences` property. This would work just fine.

However, this may be the moment to consider switching to a different arrangement for obtaining multiple components from a module. For example, the module could export three separate components: the application window as its default, and `<Settings>` and `<Preferences>` by name.

If we want to move to this arrangement, we can do so in a backwards-compatible manner: stripes-core can check for the existence of a `<Settings>` export and use that if provided, falling back when this is missing to the old approach of invoking the top-level component with `showSettings={true}`.


## Changes to existing modules

At present, some configuration is presented as settings that properly belongs in preferences. Once support for preferences is added to stripes-core, the following settings should be moved to preferences:

* All Developer settings.
* All My Profile settings.

And the following settings pages should be replicated as preferences:

* Organization --> Key bindings
* Organization --> Language and localization
* Organization --> Preferred plugins

(This list may not be exhaustive.)


## Architectural considerations

### Multiple module types

The simplest way to present preferences-only modules is as a `settings` module: this will prevent Stripes from attempting to display such modules as top-level applications.

This will work, but it's arguably not an honest representation of what such modules do. At present, we have `app` modules that can also present settings and a handler function, `settings` modules that can also present a handler function and `handler` modules that present a handler function (and can probably also provide settings). Adding preferences as another facet that modules can contribute further muddies the multi-purposeness of the module types.

It has previous been suggested that modules should instead have multiple types. For example, ui-users, which presents both a main-page application and some settings, would have:

```
"type": [ "app", "settings" ]
```

This is a good moment to consider whether that is the right route to take.

However, from another perspective, it can be argued that the only part of a module's type that matters is whether or not it's an application. Modules of type `app` have a top-bar icon and a main-page application, but may also contribute any of the other functional facets that other module-types do: settings, preferences, a handler function. All other module types do not appear in the top-bar and do not provide a main-page application, but may contribute any or all of the other functional facets. So perhaps the only distinction we need between module types is between `app` and "other"?


### Settings and Preferences as actual modules

Finally, we should give some thought to whether it makes sense to try to refactor the settings support out of stripes-core and into an actual module, ui-settings. If we did this, we would of course implement preferences in the same way, as another module.

Doing this would make the internal architecture of Stripes a better match for the UX, in which settings _looks like_ an application. Whether that is worth the work it would take is open to discussion -- especially as a putative ui-settings and ui-preferences would likely need access to parts of the Stripes internals that are currently hidden.
