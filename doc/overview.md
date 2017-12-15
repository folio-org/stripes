# Stripes for Okapi: Tools to build the FOLIO UI

The promise of FOLIO lies in its inclusiveness: we want to deliver a platform that invites participation not only from software vendors integrating their product and full time programmers at large institutions but also from librarians who happen to code on the side and would like to implement something to address their immediate needs.

Such goals are very much in line with the process of developing FOLIO in the open with a diverse community of stakeholders and so our decisions about the front-end architecture and toolkit are primarily focused on:

* Keeping things decoupled where possible so that many teams can work in parallel without stepping on each others' toes and anyone is free to modify part of the system without needing to rewrite huge swathes of it.

* Good developer ergonomics at the module level -- there will be a great many modules so we do what we can to pave the way.

* Consistent user experience through a common software stack, core UI components, opinionated guidelines and constraints.

With that in mind, our front-end toolkit "Stripes" has been taking shape.

## Single-page application

While we want UI modules to form an integrated and consistent whole, we also know this won't be the only interface to the web services that comprise FOLIO. And, since front-end tools tend to have a shorter lifespan, it is likely we will see redevelopment here while the FOLIO services running behind Okapi retain largely the same interfaces.

For these reasons, we've chosen to make Stripes a client-side only tool -- it runs entirely in the user's browser and consumes FOLIO services directly.

This is in line with the evolution of Web application development, and there are a rich array of tools to support the approach.

## Bundled per-tenant

Running in the browser entails being mindful of what code is sent out. Common practice is to bundle all the code together into a few files to improve compression and reduce the overhead that comes with multiple requests.

Stripes generates its code bundles on a per-tenant basis not only for efficiency, but for business reasons as well:

* SaaS operators can more readily trust tenants to audit Stripes modules as they will only ever be run by the tenant's users and never within the SaaS infrastructure.

* There is potential for heavy customisation should there be demand: any module or even the core system can be forked by a professional services group.

## Component-based with declarative data and managed state

[React](https://facebook.github.io/react/) components are the basic unit of Stripes. These are interface elements that are fed some set of properties and can be rendered for display. And they are composable -- that is, components can render components can render components. Diverse modules can provide a consistent experience by using the same set of components for core functionality.

Stripes components extend the functionality of raw React components in several ways:

* We extend the component encapsulation to include the data needs of the component. Rather than needing to deal with sending requests directly to Okapi, Stripes components describe what they need and are re-rendered as data becomes available.

* Re-rendering is possible because all relevant state is stored with Stripes or Okapi and managed outside of the component.

* This approach enables us to set up test harnesses where components can be fed stock data from their chosen Okapi web services (we will build on things like [Enzyme](http://airbnb.io/enzyme/) that do this more generically for React components).

## Packages and dependencies

The whole Stripes framework consists of the following set of git modules -- all of them also represented as NPM packages in the `@folio` namespace. Higher modules have dependencies on lower modules.

```

                           stripes-sample-platform
                                      |
                                      |
                                      |
                                      |
                                stripes-core
                                /     |   \
                    ___________/      |    \___________
                   /                  |                \
                  /                   |                 \
        stripes-components     stripes-connect     stripes-logger

```
`stripes-components` has a peer-dependency on `stripes-core`, because it depends on part of the `stripes-core` API -- specifically, the provision of [the Stripes object](dev-guide.md#the-stripes-object).
`stripes-connect`, and `stripes-logger` do not have a similar peer-dependency: `stripes-core` consumes their APIs rather than vice versa.
