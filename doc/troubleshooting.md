# Stripes troubleshooting

In the order we ran into them, here are some things that can go wrong when building or running Stripes, and some hints on how to fix them.

<!-- ../../okapi/doc/md2toc -l 2 troubleshooting.md -->
* [addComponentAsRefTo(...): Only a ReactOwner can have refs.](#addcomponentasrefto-only-a-reactowner-can-have-refs)
* [Warning: Invalid context `storeSubscription` of type `Subscription` ... expected instance of `Subscription`.](#warning-invalid-context-storesubscription-of-type-subscription--expected-instance-of-subscription)
* [Warning: Cannot update during an existing state transition](#warning-cannot-update-during-an-existing-state-transition)
* [EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'](#eacces-permission-denied-symlink-homemikegitworkstripes-corestripesjs---usrbinstripes)
* [Uncaught TypeError: Cannot read property 'reducersFor' of undefined](#uncaught-typeerror-cannot-read-property-reducersfor-of-undefined)
* [Editing some source files does not cause `yarn start` to rebuild](#editing-some-source-files-does-not-cause-yarn-start-to-rebuild)


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

```
"Warning: Failed context type: Invalid context `storeSubscription` of type `Subscription` supplied to `Connect(Form(UserForm))`, expected instance of `Subscription`."
```

According to comments on [Redux issue 534](https://github.com/reactjs/react-redux/issues/534), this is caused by having two copies of `react-redux` running at once, most likely due to multiple packages requiring it. The simple fix is to remove the `node_modules/react-redux` directories from all Stripes packages except `stripes-core`.


## Warning: Cannot update during an existing state transition

Under certain circumstances -- the details are not clear -- the following warning appears in the JavaScript console:

```
Warning: setState(...): Cannot update during an existing state transition (such as within `render` or another component's constructor). Render methods should be a pure function of props and state; constructor side-effects are an anti-pattern, but can be moved to `componentWillMount`.
```

See [STRIPES-216](https://issues.folio.org/browse/STRIPES-216) for details.


## EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'

On some platforms (e.g. Ubuntu 16.04.2 LTS, using Yarn and Node installed from packages), `yarn link` will fail in the `stripes-core` directory, reporting:

```
error An unexpected error occurred: "EACCES: permission denied, symlink '../../home/mike/git/work/stripes-core/stripes.js' -> '/usr/bin/stripes'".
```

The problem here is that, depending on whether NPM and/or Yarn was installed using operating-system packages (`apt-get` or Debian or Ubuntu systems), third-party packages (such as those provided by [Homebrew](https://brew.sh/) on a Mac), using NPM itself or by other means, it may end up with a different idea of where "global" installs should be. In some cases, its guess is OK; in others, it chooses somewhere where you don't have write permission. You can find out where Yarn thinks global binaries should go using the `yarn global bin` command.

The fix is to explicitly define where to do "global" installs. In the `.npmrc` file in your home directory, add a `prefix` setting, pointing to a directory that you own:

```
prefix=/home/mike/lib/npm
```

And ensure that this directory both exists and contains a `bin` subdirectory (initially empty).

It should then be possible to `yarn link`.

See [STRIPES-218](https://issues.folio.org/browse/STRIPES-218) for details.


## Uncaught TypeError: Cannot read property 'reducersFor' of undefined

Under certain circumstances, Stripes will fail to run and the JavaScript console will report

```
Uncaught TypeError: Cannot read property 'reducersFor' of undefined (bundle.js:77392)
    at OkapiResource.RESTResource (bundle.js:77392)
    at new OkapiResource (bundle.js:119656)
```

(I am seeing bundle.js rather than proper file line numbers because I am presently unable to `yarn link` Stripes Core -- see above -- so I am getting the released Stripes Core that does not do line-number mapping.)

This is caused by having a stale v1.x of `react-redux` hanging around somewhere in one of the projects' `node_modules` directory. (We don't know why that gets used rather than the one in `stripes-sample-platform`'s Node Modules, but it does.)

The fix is to re-run `yarn install` in the package that has the stale `react-redux`. If you're not sure which package that is, re-run it in all of them to be sure.

(More discussion in [STRIPES-219](https://issues.folio.org/browse/STRIPES-219).)


## Editing some source files does not cause `yarn start` to rebuild

In general, if a Stripes development server is already running when you edit one of the source files of Stripes or any included module, the server will emit a message `webpack building...`, then shortly afterwards `webpack built 2e44cab1ab6c516e60e7 in 1658ms`. So it's not necessary to restart the development server every time you make a change (though in general you do need to refresh the browser).

But sometimes, editing certain source files will _not_ make this happen, and a clumsy, time-consuming manual restart is necessary.

Internally, WebPack uses [`inotify`](http://man7.org/linux/man-pages/man7/inotify.7.html) to be informed when a source file has changed. Linux supports only a limited number of watches. Annoyingly, if WebPack exceeds this number, it doesn't inform the developer but just proceeds blindly.

You can increase the limit on the number of watches by writing to the special file `/proc/sys/fs/inotify/max_user_watches`. You will need to become root to do this:

```
$ cat /proc/sys/fs/inotify/max_user_watches
8192
$ sudo bash
[sudo] password for mike:
# echo 524288 > /proc/sys/fs/inotify/max_user_watches
# exit
$ cat /proc/sys/fs/inotify/max_user_watches
524288
$
```

Once the limit is high enough, you can restart the server (e.g. `yarn start`) and it will re-scan the source tree, so that it is subsequently able to recognise changes in any source file.


