# Adding new permissions to FOLIO UI modules

<!-- md2toc -l 2 adding-permissions.md -->
* [Add the permissions to the package file](#add-the-permissions-to-the-package-file)
* [Generate a module descriptor](#generate-a-module-descriptor)
* [Add the module descriptor to Okapi](#add-the-module-descriptor-to-okapi)
* [Associate the module with the tenant](#associate-the-module-with-the-tenant)
* [Add a permission to a user](#add-a-permission-to-a-user)
* [Use the new permissions!](#use-the-new-permissions)

We often need to add new permissions to FOLIO UI modules, then continue developing front-end code that uses those permissions. But for the permissions to become usable, they must be added to the running system. The traditional approach to solving this has been to wait for Wayne to build a new VM with the updated module descriptors. But there is an easy way to add the permissions to a local FOLIO installation.

## Add the permissions to the package file

Edit your UI module's `package.json` to include the new permissions within the `permissionSets` field of its `stripes` section. Here, I have added a test permission `test.mike`:
```
$ git diff package.json
diff --git a/package.json b/package.json
index 4cd072d..3e95bf8 100644
--- a/package.json
+++ b/package.json
@@ -31,6 +31,11 @@
     },
     "permissionSets": [
       {
+        "permissionName": "test.mike",
+        "displayName": "Test: Mike's new permission",
+        "visible": true
+      },
+      {
         "permissionName": "module.users.enabled",
         "displayName": "UI: Users module is enabled"
       },
$
```

## Generate a module descriptor

This can be done using a script provided with stripes-core (and which is used in back-end deployment):
```
$ node ../stripes-core/util/package2md.js package.json > MD.json
```
You can look at the generated module descriptor in your editor if you like. It's in the same format as any other [Okapi module descriptor](https://github.com/folio-org/okapi/blob/master/doc/guide.md#example-4-complete-moduledescriptor).

## Add the module descriptor to Okapi

You can POST the descriptor using any HTTP client utility, such as `curl`, for example: 
```
curl localhost:9130/_/proxy/modules -d @MD.json
```

Also available is the [Okapi CLI](https://github.com/thefrontside/okapi.rb). If you have that installed, you can configure it by setting the OKAPI_URL and OKAPI_TENANT environment variables to match whatever your Stripes installation is using, then use it to feed the descriptor to Okapi:
```
$ export OKAPI_URL=http://localhost:9130 OKAPI_TENANT=diku
$ cat MD.json | okapi --no-tenant create /_/proxy/modules
{
  "id": "folio_users-2.10.1",
  "name": "User management",
  "permissionSets": [
    {
      "permissionName": "test.mike",
      "displayName": "Test: Mike's new permission",
      "visible": true
    },
    [... snip ...]
  ]
}
$
```

## Associate the module with the tenant

Finally, you need to tell Okapi that the tenant you're developing for (usually `diku`) should run the module in question. This has the side-effect of notifying the permissions module of the new permissions, which then get inserted in the available-permissions database.

You need to make a descriptor that has the same module-ID as is specified in the module-descriptor. The simplest way to do that is to pluck it right out of the `MD.json` file using good old sed:
```
$ echo "{`sed -n '/"id":/s/,$//p' MD.json`}" | okapi --no-tenant create /_/proxy/tenants/diku/modules
{
  "id": "folio_users-2.10.1"
}
$
```
(If you're working on a different tenant from `diku`, be sure to modify the posting path accordingly.)

> **Note.** When re-inserting a module that was already inserted, which is what we're doing here, mod-perms will notice any new permissions and insert them, which is what we want; but it will not update already-existing permissions, so changes that you make to the description, sup-permissions, etc., cannot be updated using this technique. If you wanted to do this, you would first need to manually remove the old permissions (left as exercise for the reader) before inserting the new descriptor.

## Add a permission to a user

Since this operation, and the related ones that precede it are performed in the context of a specific logged-in user (unlike those above), we will need to log in first. Then we can need to find the ID of the user we're interested in. Finally, we can post the permission to it.
```
$ okapi login
username: diku_admin
password: *****
Login successful. Token saved to /Users/mike/.okapi
$ okapi show /users?query=username=diku_admin | grep '"id":'
      "id": "1ad737b0-d847-11e6-bf26-cec0c932ce01",
$ okapi show /perms/users/1ad737b0-d847-11e6-bf26-cec0c932ce01/permissions?indexField=userId | grep totalRecords
  "totalRecords": 43
$ echo '{"permissionName": "test.mike"}' | okapi --tenant diku create /perms/users/1ad737b0-d847-11e6-bf26-cec0c932ce01/permissions?indexField=userId
{
  "permissionName": "test.mike"
}
$ okapi show /perms/users/1ad737b0-d847-11e6-bf26-cec0c932ce01/permissions?indexField=userId | grep totalRecords
  "totalRecords": 44
```

## Use the new permissions!

If you go back to your Stripes installation, navigate to a user record, go to the edit page, and hit the **+ Add Permission** button, you should now see your newly added permissions among the options.

