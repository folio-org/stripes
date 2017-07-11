# Implementing configurable hot-keys in Stripes

<!-- ../../okapi/doc/md2toc -l 2 hotkeys.md -->
* [Background](#background)
* [Configuration of react-hotkeys](#configuration-of-react-hotkeys)
* [How this can work in Stripes](#how-this-can-work-in-stripes)
    * [Mapping key specifiers to action names](#mapping-key-specifiers-to-action-names)
    * [Action names](#action-names)
    * [Getting mappings to modules](#getting-mappings-to-modules)
* [Simplifications for v1](#simplifications-for-v1)


## Background

As described in [STRIPES-13](https://issues.folio.org/browse/STRIPES-13), we want to provide a general framework for module developers to specify hot-keys that can drive their components. And as described in [STRIPES-359](https://issues.folio.org/browse/STRIPES-359), this general requirement becomes specific in the need to navigate search-results with the keyboard -- up-arrow and down-arrow to move between results.

Our general approach will be use [the react-hotkeys library](https://github.com/Chrisui/react-hotkeys), which leverages React's existing hierarchy of components to induce a heirarchy of key-bindings which can be overridden as required on progressively lower levels. A good overview is given in [_Exploring HotKeys and focus in React_](http://chrispearce.co/exploring-hotkeys-and-focus-in-react/).

We need to provide a way to supply configuration to this library in a way that can be specified by FOLIO itself or by an individual tenant, or overridden on a per-user basis.


## Configuration of react-hotkeys

From [this post](http://chrispearce.co/exploring-hotkeys-and-focus-in-react/), the configuration of react-hotkeys looks like this:

```
const keyMap = {
  'deleteNode': ['del', 'backspace'],
  'snapLeft': 'ctrl+left',
  // ...
};

const handlers = {
  'deleteNode': this.deleteNode,
  'snapLeft': this.snap.bind(this, SNAP.LEFT),
  // ...
};

<HotKeys keyMap={keyMap} handlers={handlers}>
  <SomeComponentThatInterpretsKeys/>
</Hotkeys>
```

(This is rather odd: two maps, both of them with the same set of keys. The first one, `keymap`, seems to be reversed. But no matter -- react-hotkeys will take care of interpreting this. We just need to generate it.)

Evidently there are three kinds of thing involved in the configuration:

1. **action names** such as `deleteNode` and `snapLeft`. These are short strings with a meaning that is defined within the application. Stripes-relevant examples might be `gotoUsers`, `gotoSettings`, `clearSearch`, `nextRecord`, `edit`.
2. **key specifiers** such as `['del', 'backspace']` and `'ctrl+left'`. The acceptable forms are those of [the Mousetrap library](https://craig.is/killing/mice) and need not concern us at this stage.
3. **actual actions** such as `this.snap.bind(this, SNAP.LEFT)`. These are JavaScript fragments such as might be bound to event handlers.

Where do these things come from?

#3 are of course provided by the actual modules that interpret the keys: for example, the Users module will provide the function that opens the edit-user page.

#1 are the responsibility of the module to provide: doing so is part of the module API, and it will then be up to the invoking component (most often ultimately in stripes-core) to provide a map that associates them with the key specifications #2.

#2 are configuration that may be provided as part of FOLIO's code, or overridden by tenant-level configuration, or further overridden by user-level configuration. It will be the job of stripes-core to obtain these and provide them to the modules.


## How this can work in Stripes

What follows is a _proposal_, subject to further discussion.

### Mapping key specifiers to action names

FOLIO itself -- i.e. the stripes-core code -- provides a default set of bindings from well-known actions to key specifications. These are right in the code.

Additional bindings -- which override the defaults if they both specify a meaning for the same key specifications -- are kept in the FOLIO database, in mod-configuration.

We may additionally allow these to be further overridden by user-specific bindings, also kept in mod-configuration but associated with a specific user.

A UI settings module -- possible the existing ui-organization, maybe something new -- provides the means to maintain the tenant-wide and user-specific maps.

### Action names

How will the key-map editor know what actions exist, that key combinations can be mapped to? Stripes-core will supply a list of all the action-names that it knows about, likely in the `stripes.actionNames` array.

These are gathered from the modules that stripes-core pulls in (and of course deduplicated, since many modules will likely define, for example, an `edit` action).

Each module is responsible for providing a list of the action-names that it handles. One way to do this would be to have the modules export a well-known name such as `keyMap`; but since every module exports a React component -- which is a class -- it may be more elegant to say that the class must have a static member with a well-known name, just as stripes-connect uses the static member `manifest`.

### Getting mappings to modules

The react-hotkeys way is to pass a key-map into a `<HotKeys>` component, at which point is available to all the descendents of that component by the magic of React context. Then any descendent `<HotKeys>` component can supply a set of handlers which will be used by its own descendents. (You can supply both at once if you wish.)

In the context of Stripes, we can provide the whole key-map (generated from the data in mod-configuration) to the whole web-app by wrapping the `<Root>` component in a `<HotKeys map={globalMap}>` component.

But we can then also wrap each individual module in its own `<HotKeys map={moduleMap}>` component to provide key-mappings that are specific to the module.

(It is of course the responsibility of modules to provide the `<HotKeys handlers={handlers}>` wrapper component wherever it is needed, since only the modules can know what the actual actions are.)


## Simplifications for v1

* We will need to omit user-specific configuration for now, as we have done for locale and plugin preferences -- not least, because mod-configuration's data-model doesn't seem to have a slot for username.
* We do not need to make a GUI editor for key mappings: it will suffice for now to provide a text-area, and compile that into a key-map structure. Later, we can refine this in all sorts of ways.
* Since gathering action-names from the modules is of value only to the key-mapping editor, we don't need that part of the infrastructure at this point. The supported action names will be whatever a user types into the text-area.


