# Stripes troubleshooting

<!-- ../../okapi/doc/md2toc -l 2 troubleshooting.md -->
* [Warning: Invalid context `storeSubscription` of type `Subscription` ... expected instance of `Subscription`.](#warning-invalid-context-storesubscription-of-type-subscription--expected-instance-of-subscription)
* [Warning: Cannot update during an existing state transition](#warning-cannot-update-during-an-existing-state-transition)
* [EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'](#eacces-permission-denied-symlink-homemikegitworkstripes-corestripesjs---usrbinstripes)
* [Uncaught TypeError: Cannot read property 'reducersFor' of undefined](#uncaught-typeerror-cannot-read-property-reducersfor-of-undefined)

In the order we ran into them, here are some things that can go wrong when building or running Stripes, and some hints on how to fix them.


## addComponentAsRefTo(...): Only a ReactOwner can have refs.

Under certain circumstances, Stripes will fail to run and the JavaScript console will report

```
Uncaught Error: addComponentAsRefTo(...): Only a ReactOwner can have refs. You might be adding a ref to a component that was not created inside a component's `render` method, or you have multiple copies of React loaded (details: https://fb.me/react-refs-must-have-owner).
    at invariant (bundle.js:1509)
    at Object.addComponentAsRefTo (bundle.js:116958)
```

As the error message helpfully suggests, this is caused by the system picking up multiple copies of the React library from the `node_modules` directories of multiple Stripes-related packages, such as `stripes-core` and `ui-users`.

The fix, ridiculously, is to manually remove all copies of React from every `node_modules` directory but one -- canonically, that of `stripes-sample-platform`. So:

```
find stripes-* ui-* -name react | grep -v '^stripes-sample-platform' | xargs rm -r 
```

(More discussion in [STRIPES-220](https://issues.folio.org/browse/STRIPES-220).)


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

Under certain circumstances, Stripes will fail to run and the JavaScript console will report

```
Uncaught TypeError: Cannot read property 'reducersFor' of undefined (bundle.js:77392)
    at OkapiResource.RESTResource (bundle.js:77392)
    at new OkapiResource (bundle.js:119656)
```
(I am seeing bundle.js rather then proper file line numbers because I am presently unable to `yarn link` Stripes Core -- see above -- so I am getting the released Stripes Core that does not do line-number mapping.)

This is caused by having a stale v1.x of `react-redux` hanging around somewhere in one of the projects' `node_modules` directory. (We don't know why that gets used rather than the one in `stripes-sample-platform`'s Node Modules, but it does.)

The fix is to re-run `yarn install` in the package that has the stale `react-redux`. If you're not sure which package that is, re-run it in all of them to be sure.

(More discussion in [STRIPES-219](https://issues.folio.org/browse/STRIPES-219).)


