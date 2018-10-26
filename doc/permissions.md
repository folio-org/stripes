# Permissions in Stripes and FOLIO

<!-- ../../okapi/doc/md2toc -l 2 permissions.md -->
* [Introduction](#introduction)
* [Atomic and compound permissions](#atomic-and-compound-permissions)
* [Visible and invisible permissions](#visible-and-invisible-permissions)
* [Sources of permissions](#sources-of-permissions)
    * [Which permissions defined where?](#which-permissions-defined-where)
    * [Which permissions to check?](#which-permissions-to-check)
* [Naming permissions](#naming-permissions)
* [Permission enforcement](#permission-enforcement)
* [Access to settings](#access-to-settings)
    * [The Settings link](#the-settings-link)
    * [The various modules' entries](#the-various-modules-entries)
    * [Individual settings pages](#individual-settings-pages)
* [Outstanding issues](#outstanding-issues)
    * [Permission display-name and description](#permission-display-name-and-description)



## Introduction

In the FOLIO system, permissions are specified by short, faceted strings such as `users.collection.get` (the permission to read a collection of user records), `circulation.loans.item.put` (the permission to replace an existing loan) or `module.items.enabled` (the permission to use the Items UI module).

Permissions also have a human-readable display-name such as "Get a collection of user records", "circulation - modify loan in storage" or "UI: Users module is enabled". But this is only for the benefit of administrators, and does not affect how the permissions function.

Permissions can be associated with users. A user is then said to _have_ those permissions.



## Atomic and compound permissions

The definition of a permission may include one or more sub-permissions. A user who has a permission automatically has all of its sub-permissions (and all their sub-permissions, and so on).

A permission with no sub-permissions is called an _atomic permission_, and one that does have sub-permissions is called a _compound permission_. (We sometimes also use the term "permission set" for the latter; but since permission sets _are_ permissions -- merely those that happen to have sub-permissions -- the permission-vs-permission-set dichotomy is misleading.)



## Visible and invisible permissions

Also included in the definition of each permission is a single bit that determines whether or not it is visible to users of the FOLIO system: that is, whether it is listed among those that can be included in a permission set, or associated with a user. In general, atomic permissions and other low-level permissions are invisible: FOLIO administrators do not want to be concerned with details such as `users.collection.get` (the permissions to read a collection of user records), but with higher-level ideas such as `ui-users.view` (permission to view a user profile) which includes not only `users.collection.get` but also related low-level permissions such as `users-bl.item.get` (ability to fetch full user records), `usergroups.collection.get` (ability to fetch the names of all the patron-groups), etc.

User stories are written entirely in terms of visible high-level permissions (as they must be, since users are not even directly aware of the existence of invisible permissions). However, implementation of permission checks is done almost entirely using low-level and invisible permissions -- see [below](#which-permissions-to-check).



## Sources of permissions

Permissions are defined in the module descriptors of FOLIO modules -- both back-end and front-end modules. When a module descriptor is posted to Okapi, one of the effects is that the permissions it defines are inserted into the available-permissions list. They are then available to be associated with individual users.

(Back in the bad old days, the ansible build scripts for FOLIO VMs used to explicitly add certain permissions to the database. That was a temporary measure: this is no longer done, and _all_ permissions are now loaded from modules' descriptors.)

In addition, high-level permission sets can be defined at run-time (using **Settings > Users > Permission sets**); but since these are tenant-specific, no software may rely directly on them, and they are useful only as a particular site's aggregation for administrative purposes. As such, these permission sets are not of interest to us here.


### Which permissions defined where?

In determining which permissions should be defined in front-end modules and which in back-end modules, some principles are obvious:

* Permissions which a back-end module checks should generally be defined in that back-end module. (Since it checks them, they are part of the API it consumes: so it must define them, otherwise it might find itself running in contexts where they do not exist.) However, one back-end module depends on another, lower-level one -- for example, mod-users-bl depending on mod-users -- it is acceptable for the higher-level module to check for permissions defined in the lower-level module.

* Permissions which are enforced only in a front-end module should be defined in the front-end. There is no need for back-end modules to be encumbered by the knowledge of such permissions.

* In general, a permission enforced in a front-end module should be defined in that particular front-end module, and a permission enforced by Stripes itself should be defined by stripes-core. However, as a special case, stripes-core enforces the various `module.NAME.enabled` and `settings.NAME.enabled` permissions provided by the modules called _NAME_.


### Which permissions to check?

Code should nearly always check atomic permissions rather than higher-level permissions that include them. This approach allows us to be maximally precise regarding what permissions are needed. It also makes the checking code robust against changes in high-level permission definitions which may be enacted either due to the preferences of the SIGs, or a tenant-specific convention.

In particular:

* Back-end modules should _always_ check atomic permissions, since these modules know the real truth about which permissions are logically associated with which operations. Also, modules may only rely on permissions defined either by themselves or by lower-level modules whose APIs they consume -- and back-end modules generally define only atomic permissions, and have dependencies only on other back-end modules.

* Front-end modules should _usually_ check atomic permissions, also. They can safely do so since the set of permissions published by a back-end module is part of its API. (And when we have automatic generation of API docs, the permissions should definitely be included.) So as soon as a front-end module is using (say) the `users` interface v14.0, it is assuming the existence not only of the `/users/ID` path, but also the `users.item.get` permission.



## Naming permissions

Each module that defines permissions should use a unique prefix, related to the module-name, at the start of the names of permissions that it defines. For example, mod-users defines the "ability to read a collection of user records" permission, so the name of that permission has a `users` prefix, yielding `users.collection.get`.

Permissions defined in front-end modules are given names whose prefixes begin with `ui-`. For example, the high-level "can edit user profiles" permission, defined in ui-users, is named `ui-users.edit`.

(In the past, modules have sometimes defined permissions with names that belong to other modules. For example, the high-level "can edit user profiles" permissions was originally defined on the server-side "users-bl" (business logic) module and named `users-bl.edit`. When the software was enhanced so that UI modules could define permissions, this permission was moved across to ui-users, but initially retained its old name `users-bl.edit`. This is no longer done: the permission has been renamed `ui-users.edit`.)



## Permission enforcement

A user is allowed to perform an operation only if they have the necessary permission.

Almost all permissions are rigorously enforced on the back-end by Okapi -- e.g. mod-users will simply never receive a request to read collections of user records sent by a user without the `users.collection.get` permission. (For most permissions, the back-end module itself need do no checking: it just declares in its module descriptor which permissions are required for which operations need which permissions, and Okapi takes care of it. Individual back-end modules are however responsible for checking the presence or "desired permissions" -- an esoteric concept of no direct importance to the front end.)

In addition to this, the UI code also checks permissions, so that it can avoid offering the user operations that it knows will fail on the back-end. For example, a user without the `circulation.loans.item.put` permission is not offered the opportunity to renew a loan, since the UI knows that the attempt to do so would be rejected by the back-end module.

A few permissions are checked only on the UI side: for example, the link to the Items UI module is displayed only to users who have the `module.items.enabled` permission. While a different UI could bypass such UI-only permissions, doing so would not violate security as the back-end permissions would still be checked. Omitting UI elements for which the relevant back-end features will not permit operations is a service to the user, not a security feature.



## Access to settings

Settings in Stripes provide a way to change the behaviour of the application in persistent ways. Most application modules provide some settings pages in addition to their main application; in addition, special modules of type `settings` provide _only_ settings pages -- for example, the Organization module provides settings that affect the whole applications, such as the selection of the locale and preferred plugins.

Each module that supports settings provides one or more settings pages, each of which a given user may or may not have the necessary permissions to access. Conventions in how we use permissions ensure that:

* Only users with suitable permissions can see a given settings page.
* Only users with access to one of more settings pages within a module can see that module's settings.
* Only users with access to one or more modules' settings can see the top-level Settings link.

Here is how this is handled, from the top down.


### The Settings link

The top-level Settings link is displayed only if the user has the `settings.enabled` permission. This is defined in stripes-core itself. It is never explicitly assigned to any user, but is included as a sub-permission in all the module-level settings permissions.


### The various modules' entries

Each module defines an additional permission, `settings.NAME.enabled`, and stripes-core displays the module's entry in the permissions menu only if this is defined.

Each `settings.NAME.enabled` permission includes `settings.enabled` as a sub-permission, so that a user who has any of the module-level settings permissions automatically sees the top-level Settings link.


### Individual settings pages

Each individual settings page ("Permission sets", "Patron groups", "Address Types", etc.) is guarded by a specified permission, and is made available only to users who have that permission -- for example, the "Permission sets" settings page is restricted to users who have the `ui-users.editpermsets` permission.

These guard-permissions should be high-level permissions defined by the UI module. Each such permission for a specific part of the settings should include the relevant module-wide settings permission (in this case `settings.users.enabled`). This ensures that the module is included in the Settings menu, which in turn ensures that the Settings menu is made available.



## Outstanding issues


### Permission display-name and description

The permission fields `displayName` and `description` are both human-readable, but have different roles. There is presently some inconsistency in how they are presently used. For example:

* In ui-users, the `displayName` is a human-readable name such as "Users: Can create new user"; and the `description` is used as a note such as "Some subperms can be deleted later when bl does updates and ModulePermissions can be used".

* In mod-users, the `displayName` is essentially a restatement of the machine-readable permission name (e.g. "users collection get" for `users.collection.get`) and the `description` is a more useful human-readable text such as "Get a collection of user records".

* In mod-circulation, the `displayName` is a human-readable string such as "circulation - modify loan in storage" and the `description` is a redundant repetition of the part of the display-name following the module name -- e.g. "modify loan in storage".

All of these approaches are inconsistent, and none of them is really satisfactory. I suggest that there is little real use for the `description` field, at least for most permissions, and its existence has confused matters.

My suggestion: `displayName` should always be a human-readable permission name, and should be consistently capitalised across modules. It should generally begin with a category such as "Users:" or "Settings (Circ):". The `description` field should generally be left blank, but may be used for an explanatory note when the meaning of a permission is not self-evident. It should not be used for implementation notes such as the example above from ui-users.


