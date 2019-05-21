# Routing guide

Routing in FOLIO apps is handled via React-router, which conditionally renders components based on the content of the browser's address bar.
```
import { Route } from '@folio/stripes/core';
<Route path="/users" component={UsersContainer} />
```
When the address bar contains the path "/users", the `UsersContainer` component will be rendered - whether the address was reached from a clicked link from an internal or external source, or if the user entered it into the address bar manually.

# Routing Components
`stripes-core` provides exports of `react-router` components. The primary ones that you will make use of are `<Route/>`, `<Switch/>`, and `<Link/>`.

## `<Route>`
As mentioned before, `<Route>` accepts a `path` prop and a `component` prop. When the browsers' location path matches the `path` prop, the React component provided in the `component` prop will render. This component will be passed certain react-router props of `location`, `history`, and `match` which will be discussed later.
## `<Switch>`
Contains a list of `<Routes` as children and will render **the first** in the list that matches its `path` prop.
```
<Switch>
    <Route path="/users/loans" component={LoansContainer} />
    <Route path="/users" component={UsersContainer} />
</Switch>
```
In this example, the location `/users/loans/loanid` would match both `<Route>` paths, but since the first one matches, it will be the only one rendered.

## `<Link>`
These components render anchor tags. They are passed a `to` prop that can either be a string url, or a `location` object containing a `pathname`, `search`, `hash`, and `state`  keys. The first 3 relate to parts of the URL, and state is an object that will persist and be passed through to the next route-rendered component for its possible consumption via its `location` prop.
```
const id = '123456';
const loc = {
    pathname: '/users/loans',
    search: `?loan=${id}`,
    state: { referrer: 'home' }
};

<Link to={loc}>View loan {id}</Link>
```
Providing FOLIO's `<Button>` component with a `to` prop will render a react-router `<Link/>`.
```
<Button to={loc}>View loan</Button>
```
## Routing strategy
It's most convenient for maintenance if routing is set up at the top level of your module, within its `index.js`. Ths allows you to see all of the different `paths` that your application makes use of in one place.
```
        <Switch>
          <Route path="/users/:id/loans/view/:loanid" component={Routes.LoanDetailContainer} />
          <Route path="/users/:id/loans/:loanstatus" component={Routes.LoansListingContainer} />
          <Route path="/users/:id/chargefee" component={Routes.FeesFinesContainer} />
          <Route path="/users/:id/edit" exact component={Routes.UserEditContainer} />
          <Route path="/users" component={Routes.UserSearchContainer}>
            <Route path="/users/view/:id" component={Routes.UserViewContainer} />
          </Route>
          <Route render={this.noMatch} />
        </Switch>
```
Use general code strategies here if you need to... the `path` prop is just a string so you can use template strings if necessary.
It's also possible to define a list of objects with routes and components, and render a list of `<Routes>` via a loop.

## Routing params
As you can see in the above example, the paths contain some segments that are delimited with `:`. These tell `react-router` that this could be an arbitrary string or a system generated id. The best part, this segment of the location's path will be available for use in the rendered component's logic via the `match.params` prop. For example, 
```
// the route...
<Route path="/users/:id" component={UserContainer} />
...
// The contents of UserContainer can make use of the "id" param.
const userId = this.props.match.params.id;
```
As you create components for each view of your application, think about ways that you can use this logic, as it will save you a great many lines of code in state/event handling.

## "Route" components or containers and "view" components.
An ideal strategy in the structure of components in your modules would be to separate those 'connected' components from the 'presentational' or 'view' components. This allows you to have clean separation between your data-getting components and your presentational ones. With `stripes-connect`, your `*-Container` components will contain, at very least, a static `manifest`. Example container: 

<details>
<summary>Example code for "container" component</summary>

```
// data-getting, resources live here and are passed down in props to presentational 'view' components.
import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';

class UserRecordContainer extends React.Component {
  static manifest = Object.freeze({
    user: {
      type: 'okapi',
      path: 'users/:{id}', //:{id} replaced by react-router's 'id' param.
      clear: false,
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
      records: 'usergroups',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes?query=cql.allRecords=1 sortby desc',
      records: 'addressTypes',
    }
  });

  render() {
    const { children, ...rest } = this.props;
    // expose props through render props if necessary...
    if (typeof children === 'function') {
      return children({ source: this.source, ...rest });
    }
    return (<UserView {...this.props} />);
  }
}

export default stripesConnect(UserRecordContainer);
```
</details>

<details>
<summary>Example code for "view" component</summary>

```
class UserView extends React.Component {
    static propTypes = static propTypes = {
    resources: PropTypes.shape({
      user: PropTypes.arrayOf(PropTypes.object),
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loansHistory: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      addressTypes:  PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      user: PropTypes.shape({
        PUT: PropTypes.func.isRequired,
      }),
    }),
    // the next 3 are react-router provided...
    match: PropTypes.shape({ 
      path: PropTypes.string.isRequired,
      params: PropTypes.shape({
        id: PropTypes.string,
      }),
    }).isRequired,
    location: PropTypes.object,  
    history: PropTypes.object,
  };
    render() {
        return( ... jsx )
    }
}
```
</details>

## Navigation
Declarative navigation can be accomplished using `<Link>` (or `<Button>`) components and to props with simple string paths that correspond with your routing index.
```
<Link to="/users">User search</Link>
```
If necessary, functional navigation can also be created using the `history.push()` method. It's possible to create a file of utility exports that can be re-used among your components...
```
export function goToUserDetail(e, user, history, params) {
    history.push(`/users/${params.id}`);
}

export function goToLoanDetail(e, loan, history, params) {
    history.push(`/users/${params.id}/loans/view/${loan.id}`);
}
```
A suggested pattern of import:
```
import * as navigate from '../navigation';
...
onClick = {() => {navigate.goToUserDetail(...)}
```
## Back buttons
A call to `history.goBack()` will perform the same functionality as the user clicking the browser's "back" button. Be careful with this, as this may not always be where the user wants to go.
If a view has a sub-navigation or tabs that are all links and affect the browser's location, use of the `history.goBack()` on an exit button (X) will merely take them to the last sub-navigation, when they may actually want to exit the view entirely. It's ideal to be as explicit with where the close button will take the user as possible.
The universal navigation of the stripes UI always presents a link to the 'home' of your module, so a user always has access if they need to get back to the top level of your app. If it's not possible determine what the destination the (X) button will point to, it may be ideal to include multiple links in order to help the user get to where they need to go.

## Application structure
Routing set up can impact folder structure, so this is a suggested layout to keep things organized.
```
- /src
-- index.js // containing top-level Route components
-- navigation.js
-- /routes   // Container components go here
-- /components // presentational components go here
---- /views // top-level presentational components
---- ...other presentational component folders...
```
## Notes on converting from layer-based routes
- query.layer is no longer necessary, so the associated event handlers/conditional rendering can be removed. This can result in dramatic code reduction and better maintainability.
- Routes of your application should be independent. Either house prop values/handlers in a separate file, or move them to the view components themselves.
- View components should handle their own 'loading' state. Simple conditional rendering can greatly improve the user experience. 
- `<SearchAndSortQuery>` from `stripes-smart-components` can help you manage query parameters and create search/results UI's without requiring a 3-pane layout.
- Routes/workflows in your component can have their own query string - they no longer have to dodge or namespace their parameters (although the capability is still there if they'd like to)
- If using stripes-connect, `resources` is your go-to prop for data connection. No more confusion between `resources` and `parentResources`
