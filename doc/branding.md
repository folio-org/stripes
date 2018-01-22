# Branding

## Introduction

Stripes UI bundles are built on a per-tenant basis.
Each bundle can be configured with tenant-specific assets for branding purposes.  At this time, the following basic items are configurable:

* Logo and alt text
* Favicon


## Configuration

The `branding` section of the Stripes configuration file, typically `stripes.config.js`, is used to set tenant-specific branding options.

```
module.exports = {
  okapi: {},
  config: {},
  modules: {},

  branding: {
    logo: {
      src: './tenant-assets/my-logo.png',
      alt: 'my alt text',
    },
    favicon: {
      src: './tenant-assets/my-favicon.ico',
    },
  },
};
```

The `branding` section is optional.  Generic FOLIO-branded values are automatically applied when no tenant settings have been specified.

Branding assets must be available on the local build system.  All `src` paths, such as `'./path/to/my-logo.png'`, must be relative to the working directory of the build.

At build time, the branding assets will be picked up by the file loader and included in Webpack output directory.


## Use within Stripes UI components

To access branding values within the UI, import `branding` from the `stripes-config` module.  For example:

```
import { branding } from 'stripes-config';
```

Then apply the desired values to your image or component:
```
<img src={branding.logo.src} alt={branding.logo.alt} />
```
