## How to develop a new app

* Follow the steps for [developing existing applications](app-dev-existing.md), cloning your repository into the workspace alongside the platform.
* Add an entry for your app in the platform's `stripes.config.js.local` file.
* Publish the permissions necessary to access your app to the okapi environment you are running stripes against, for example:
```
curl --location --request POST 'https://folio-snapshot-okapi.dev.folio.org:443/perms/permissions' \
--header 'x-okapi-tenant: SOME_TENANT' \
--header 'x-okapi-token: SOME_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
            "permissionName": "module.YOUR_MODULE.enabled",
            "displayName": "UI: YOUR_MODULE is enabled",
            "mutable": false,
            "visible": false
        }'

curl --location --request POST 'https://folio-snapshot-okapi.dev.folio.org:443/perms/permissions' \
--header 'x-okapi-tenant: SOME_TENANT' \
--header 'x-okapi-token: SOME_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
            "permissionName": "YOUR_MODULE.all-the-things",
            "displayName": "UI: YOUR_MODULE is enabled",
            "mutable": false,
            "visible": true,
            "subPermissions": [
              "module.YOUR_MODULE.enabled"
            ]
        }'
```
* Grant the visible permission to a user via the UI. NB: Do not grant permissions to `diku_admin` via the UI, at least until [UIU-2075](https://issues.folio.org/browse/UIU-2075) is resolved, and if it is resolved, please remove this sentence.