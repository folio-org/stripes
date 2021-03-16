# Custom Fields

This doc is intended to guide developers who wish to work with custom fields defined against interfaces and on given record types.

## What are custom fields?

Custom fields are tenant-defined fields that can be assigned to any record type that supports custom fields. They are stored and managed by [`mod-custom-fields`](https://github.com/folio-org/folio-custom-fields). A module announces its support via its ModuleDescriptor, [eg `mod-users`](https://github.com/folio-org/mod-users/blob/v17.3.0/descriptors/ModuleDescriptor-template.json#L145). Then any custom fields are defined by a user for the tenant (eg, via the [Settings > Users > Custom fields](https://github.com/folio-org/ui-users/blob/master/src/settings/CustomFieldsSettings.js) configuration).

Fetching the list of custom fields requires setting the `X-Okapi-Module-Id` header, as mentioned in the `mod-custom-fields` documentation. This means that the fetch requires knowledge of which specific module ID is present on the system (eg, `mod-users-17.3.2`). However, you should **never hardcode the name or version of a backend module in your frontend code.** Doing so breaks the ability to swap in different modules that implement the same _interface._ For example, if someone didn't want to store user data but instead look it up from an [Active Directory](https://en.wikipedia.org/wiki/Active_Directory) listing, they could write `mod-active-directory-users` that implements the `users` interface and it should still work with the existing `ui-users` frontend app.

## So how should I get a list of custom fields on the frontend?

Use the [`useCustomFields` hook](https://github.com/folio-org/stripes-core/blob/master/src/useCustomFields.js). You need to give it _some_ info about the custom fields you're interested in, so the way you scope that is by giving it the `id` of an interface that is a sibling to the `custom-fields` interface. In the example of mod-users above, the `users` interface is a sibling of `custom-fields` because they're both defined at the top level of the `provides` array.

Note that a module can implement custom fields for several kinds of records that it stores. You probably want to be able to grab the custom fields only for a given type of a record, a specific `entityType`. E.g., [`ui-users` calls its user records a `user` entity](https://github.com/folio-org/ui-users/blob/v5.0.9/src/settings/CustomFieldsSettings.js#L29). 

Put it all together and you can have something like this:
```
const UserCustomFields = () => {
  const [customFields, error, loading] = useCustomFields('users');
  
  if (loading) return <Spinner />;
  if (error) return <Error>{error}</Error>; 
  
  return (
    <div>
      <h1>These are the Custom Fields that can be defined for a User</h1>
      <ul>{customFields.filter(cf => cf.entityType === 'user').map(cf => <li>{cf.name}</li>)}</ul>
    </div>
  );
}
```
