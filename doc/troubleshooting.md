# Stripes troubleshooting

<!-- ../../okapi/doc/md2toc -l 2 troubleshooting.md -->
* [Warning: Invalid context `storeSubscription` of type `Subscription` ... expected instance of `Subscription`.](#warning-invalid-context-storesubscription-of-type-subscription--expected-instance-of-subscription)
* [Warning: Cannot update during an existing state transition](#warning-cannot-update-during-an-existing-state-transition)
* [EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'](#eacces-permission-denied-symlink-homemikegitworkstripes-corestripesjs---usrbinstripes)
* [Uncaught TypeError: Cannot read property 'reducersFor' of undefined](#uncaught-typeerror-cannot-read-property-reducersfor-of-undefined)

In no particular order, here are some things that can go wrong when building or running Stripes, and some hints on how to fix them.


## Warning: Invalid context `storeSubscription` of type `Subscription` ... expected instance of `Subscription`.

Sometimes, when loading a React component for the first time, the JavaScript console will display the rather incoherent message:

> "Warning: Failed context type: Invalid context `storeSubscription` of type `Subscription` supplied to `Connect(Form(UserForm))`, expected instance of `Subscription`."

According to comments on [Redux issue 534](https://github.com/reactjs/react-redux/issues/534), this is caused by having two copies of `react-redux` running at once, most likely due to multiple packages requiring it. The simple fix is to remove the `node_modules/react-redux` directories from all Stripes packages except `stripes-core`.


## Warning: Cannot update during an existing state transition

Under certain circumstances -- the details are not clear -- the following warning appears in the JavaScript console:

> Warning: setState(...): Cannot update during an existing state transition (such as within `render` or another component's constructor). Render methods should be a pure function of props and state; constructor side-effects are an anti-pattern, but can be moved to `componentWillMount`.

See [STRIPES-216](https://issues.folio.org/browse/STRIPES-216) for details.


## EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'

On some platforms (e.g. Ubuntu 16.04.2 LTS, using Yarn and Node installed from packages), `yarn link` will fail in the `stripes-core` directory, reporting:

> error An unexpected error occurred: "EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'".

We do not yet know how to resolve this:
See [STRIPES-218](https://issues.folio.org/browse/STRIPES-218).


## Uncaught TypeError: Cannot read property 'reducersFor' of undefined

Under certain circumstances, the JavaScript console will report

```
Uncaught TypeError: Cannot read property 'reducersFor' of undefined (bundle.js:77392)
    at OkapiResource.RESTResource (bundle.js:77392)
    at new OkapiResource (bundle.js:119656)
```
(I am seeing bundle.js rather then proper file line numbers because I am presently unable to `yarn link` Stripes Core -- see above -- so I am getting the released Stripes Core that does not do line-number mapping.)

Several different people have encountered this at various times, and all of them have made it go away somehow -- but so far, we don't really know _why_. Further bulletins as events warrant.

