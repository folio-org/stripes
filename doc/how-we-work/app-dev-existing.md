## How to develop exisiting applications and libraries

For local development of UI apps and libraries, use a yarn or npm workspace containing git clones of a platform and the apps where you will make commits. Although dependency resolution in a workspace is different than in production, it provides the easiest development experience and makes it easiest for other devs to help you if you run into trouble.

Most stripes modules support hot-module reloading (changes you make in your editor are immediately reflected in the running app).

### TL;DR

* Create a yarn workspace containing git-clones of `platform-core#snapshot` and the modules where you will make commits. It's not necessary to clone any `stripes-*` libraries in your platform unless you need to make changes to them as well. Configure the platform to use a publicly available okapi instance. Install dependencies using the `npm-folioci` (development) registry and launch stripes in a browser:
```
cat > package.json <<EOT
{
  "private": true,
  "workspaces": [
      "*"
  ]
}
EOT

cat > .npmrc <<EOT
@folio:registry = "https://repository.folio.org/repository/npm-folioci/"
EOT

git clone git@github.com:folio-org/platform-core.git
git -C platform-core checkout snapshot
cat platform-core/stripes.config.js | sed -E 's/http:\/\/localhost:9130/https:\/\/folio-testing-okapi.dev.folio.org/g' > platform-core/stripes.config.js.local
yarn
cd platform-core
yarn local &
open http://localhost:3000

```

### Change the apps available for local development

Clone apps in the top-level workspace, i.e. as _siblings_ to `platform-core`, then install their dependencies by running `yarn` in the _workspace_:
```
cd path/to/your/workspace
git clone git@github.com:folio-org/ui-app.git
yarn
```
If the app is not already part of the platform, add it to the platform's `stripes.config.js.local` `modules` list.

### Notes

* Apps generally support hot-module reloading so changes you make in a text editor are immediately reflected in the browser. Translations, however, are only parsed on startup. If you add or change a translation, you must completely rebuild the bundle (^c in the platform, then `yarn local`).
* To test new permissions, you must first publish them to the okapi environment you are running against. Use curl or Postman to create a POST request to `/perms/permissions`. This happens automatically as part of the build process for the reference environments.
* To change the order of apps in the UI, change their order in the `stripes.config.js.local` `modules` object. Yes, its an object, but key-order is stable in JS, unlike Perl.
* If you see errors like this:
```
Error: Error: No QueryClient set, use QueryClientProvider to set one
```
it's generally because multiple versions of `react` or a `stripes-*` library have been pulled into the build; only a single version is allowed. We are working to improve the tooling that will detect this for you automatically. Run `yarn why react` and/or `yarn why @folio/stripes` in the workspace to see what versions are part of your build and why, then fix those dependencies as necessary. Hammering in specific versions via the workspace's `package.json` `resolutions` entry can be a quick fix to get things running but it can also hide problems that crop up later in production where no such entry exists, so be careful with that.
* In a workspace, only the _workspace's_ `package.json` file's `resolutions` entries will be respected. This means the `yarn.lock` files in your platforms and apps will be ignored.
* To cut down on warnings about missing peer dependencies, copy the platform's dependencies into the workspace's `package.json` file. Yarn expects a module's peer-deps to be supplied by a module higher in the build hierarchy. In a production build, a platform is higher than a ui-app or a stripes-library. In a workspace build, however, the platform and the apps and the stripes libraries are all siblings. Yarn hoists all their deps up to the workspace, so all the necessary deps are in fact provided, but yarn whines that it didn't find them where it expected them to be.
* It is possible to develop in a totally self-contained environment by running Okapi in a VM using Vagrant. The `snapshot-backend-core` Vagrant box is built nightly. It requires ~8GB RAM to run comfortably. Use the following `Vagrantfile`:
```
Vagrant.configure("2") do |config|
  config.vm.box = "folio/snapshot-backend-core"
  # config.vm.provider "virtualbox" do |vb|
  #   vb.memory = 8192
  # end
  config.vm.synced_folder "logs/", "/home/vagrant/logs"
end
```
In the install instructions above, leave the `okapi.url` value set to `http://localhost:9130` instead of replacing it with the address of a publicly hosted Okapi environment.
