# Plugins for Stripes

_A proposal from a Dublin breakout group._

## Background

There is a universe of NPM modules.

Some of these are Stripes modules. (See [The Module Developer's Guide](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md#modules) for the prerequisites that make an NPM module a Stripes modules.)

All Stripes modules have a type, such as "app" or "settings", which is specified in their `package.json`. So Stripes apps are a subset of Stripes modules, which are a subset of NPM modules.

## Proposal

We now introduce a new module type, "plugin". This has a lower-level type, represented by a `pluginType` field in the `package.json`. Plugin types might be "markdownEditor", "MARCViewer", etc.

"app" modules get rendered into the main area; "settings" modules get rendered into the settings area. But "plugin" modules don't get rendered at all by default -- only when called on by the pluggable surface in another module.

We add a new `<Pluggable>` component, a wrapper for other components. If we use `<Pluggable pluginType="markdownEditor">`, it renders its children by default; but if there is an available plugin module whose plugin-type is "markdownEditor" then its top-level component is rendered instead.

There may be multiple plugins of the same plugin type; we will need a Settings module for selecting which of the extant plugins of each type is to be used. We may enable this at the tenant level, and perhaps allow individual users to override the tenant-level selection. So a particular user might prefer to use MikesMarkdownEditor rather than the tenant-wide selection of JasonsMarkdownEditor.

**That's it**
