# Stripes: quick start

To run Stripes, you'll need to have [Node.js](https://nodejs.org/) 6.x installed.
```
node --version
v6.8.0
```

Then install the Stripes modules and run as follows:

```
cd stripes-core
npm config set @folio:registry https://repository.folio.org/repository/npm-folio/
npm install
npm config set @folio-sample-modules:registry https://repository.folio.org/repository/npm-folio/
npm install @folio-sample-modules/trivial
npm start
```

## Some details

Here is what the steps above do.

Add the FOLIO NPM registry to your local NPM configuration:
```
npm config set @folio:registry https://repository.folio.org/repository/npm-folio/
```
Retrieve the necessary dependencies:
```
npm install
```

At this point you have what you need to run the system. Edit `stripes.config.js` to indicate which modules you want to include and the URL to the back end. Run `npm start` to bring up a development server at http://localhost:3000/ or `npm run build` to output a set of files which can then be deployed to a web server.

## Demos

We have some sample modules to play with in the `@npm-sample-modules` scope on our registry. Run this to let it know where to look:
```
npm config set @folio-sample-modules:registry https://repository.folio.org/repository/npm-folio/
```

### The `trivial` module

The default configuration references a module, `trivial`, which demonstrates a simple use of `stripes-connect` to store data locally. You can install it via npm:
```
npm install @folio-sample-modules/trivial
```

### The `trivial-okapi` module

Another demo, `trivial-okapi`, shows the most basic communication with the [Okapi](https://github.com/folio-org/okapi) API gateway and will require a connection to it in order to run. It lists tenants and allows their deletion. This simple exercise only relies on Okapi rather than a collection of services so it's relatively easy to set up locally without needing Docker.

Install the demo module:
```
npm install @folio-sample-modules/trivial-okapi
```
After following build instructions in the [Okapi repository](https://github.com/folio-org/okapi) to get the service running, you can activate module `trivial-okapi` module by editing `stripes.config.js` before starting the dev server or building a bundle. If you have yet to create this file, copy `stripes.config.js.example` as a base.

## Including a module under development

Both `stripes-loader` and `stripes-core` need to be able to resolve a `require()` of the string you use to reference your module when including it in `stripes.config.js` which governs which modules webpack bundles. One convenient approach is to place a symbolic link to it in `node_modules/@folio` or `node_modules/@folio-sample-modules` as these are already included in Webpack's search path.

For example, to include `some-module` from `/devstuff/some-module`: 

```
cd stripes-core/node_modules/@folio-sample-modules
ln -s /devstuff/some-module .
```
