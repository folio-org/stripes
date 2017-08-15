# Permissions in Stripes and FOLIO

<!-- ../../okapi/doc/md2toc -l 2 permissions.md -->
* [What permissions are](#what-permissions-are)
* [Permissions enforcement by back-end modules](#permissions-enforcement-by-back-end-modules)
* [Sources of permissions](#sources-of-permissions)
* [Issue 1: which permissions defined where?](#issue-1-which-permissions-defined-where)

## What permissions are

In the FOLIO system, permissions are specified by short, faceted strings such as `users.collection.get` (the permissions to read a collection of user records), `circulation.loans.item.put` (the permission to replace an existing loan) or `module.items.enabled` (the permission to use the Items UI module).

Permissions get associated with users. A user is allowed to perform an operation only if they have the necessary permission.


## Permissions enforcement by back-end modules

Most permissions are rigorously enforced by back-end modules -- e.g. mod-users simply will not allow someone without the `users.collection.get` permission to read collections of user records. But the UI code also checks permissions, so that it can avoid offering the user operations that it knows will fail due to lack of permissions. For example, a user without the `circulation.loans.item.put` permission is not offered the opportunity to renew a loan, since the attempt to do so will be rejected by the back-end module.

A few permissions are checked only on the UI side: for example, the link to the Items UI module is displayed only to users who have the `module.items.enabled` permission. While a different UI could bypass such UI-only permissions, doing so would not violate security as the back-end permissions would still be checked. Omitting UI elements for which the relevant back-end features will not permit operations is a service to the user, not a security feature.


## Atomic and compound permissions

XXX

XXX always check atomic


## Sources of permissions

Permissions are defined in the module decriptors of FOLIO modules -- both back-end and front-end modules. When a module descriptor is posted to Okapi, one of the effects is that the permissions it defines are inserted into the available-permissions list. They are then available to be associated with individual users.

(Back in the bad old days, the ansible build scripts for FOLIO VMs used to explicitly add certain permissions to the database. As far as I know, this is no longer done, and _all_ permissions are now loaded from modules' descriptors?)

In addition, high-level permission sets can be defined at run-time (using **Settings > Users > Permission sets**); but since these are tenant-specific, no software may rely directly on them, and they are useful only as a particular site's aggregation for administrative purposes. As such, these permission sets are not of interest to us here.


## Issue 1: which permissions defined where?

Specifically, which permissions should be defined in front-end modules and which in back-end modules? Some principles are obvious:

* Permissions which a back-end module checks should be defined in that back-end module. (They are part of the API it consumes, so it must define them otherwise it might run in contexts where they do not exist.)

* Permission which are enforced only in a front-end module should be defined in the front-end. There is no need for back-end modules to be encumbered by the knowledge of such permissions.

* _In general_, a permission enforced in a front-end module should be defined in that particular front-end module, and a permission enforced by Stripes itself should be defined by stripes-core. However, as a special case, stripes-core enforced the various `module.NAME.enabled` permissions provided by the modules called _NAME_.

But this leaves some scope for judgement.

See https://github.com/folio-org/ui-users/compare/ed07f8bcce4a8d4177c17e728729c31a60263058...STRIPES-435

