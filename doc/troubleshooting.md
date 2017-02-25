# Stripes troubleshooting

In no particular order, here are some things that can go wrong when building or running Stripes, and some hints on how to fix them.


## Warning: Invalid context `storeSubscription` of type `Subscription` ... expected instance of `Subscription`.

Sometimes, when loading a React component for the first time, the JavaScript console will display the rather incoherent message:

> "Warning: Failed context type: Invalid context `storeSubscription` of type `Subscription` supplied to `Connect(Form(UserForm))`, expected instance of `Subscription`."

According to comments on [Redux issue 534](https://github.com/reactjs/react-redux/issues/534), this is caused by having two copies of `react-redux` running at once, most likely due to multiple packages requiring it. The simple fix is to remove the `node_modules/react-redux` directories from all Stripes packages except `stripes-core`.


## Warning: Cannot update during an existing state transition

Under certain circumstances -- the details are not clear -- the following warning appears in the JavaScript console:

> Warning: setState(...): Cannot update during an existing state transition (such as within `render` or another component's constructor). Render methods should be a pure function of props and state; constructor side-effects are an anti-pattern, but can be moved to `componentWillMount`.

See [STRIPES-2016](https://issues.folio.org/browse/STRIPES-216) for details.


