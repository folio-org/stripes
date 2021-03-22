## How to Jira

The normal status progression of a ticket is:
* Open
* In Progress
* In Code Review
* In Review
* Closed

Typically, devs move tickets through the first four and only POs mark tickets "Closed" after they have reviewed the functionality in a reference environment. If a ticket has no user-facing changes (e.g. it is a non-functional requirement (NFR) such as updating the version of a dependency), devs may close tickets themselves.

### Ordinary time

* When you pick up a ticket, assign it to yourself and change its status to "In Progress" from the "Workflow" menu.
* When you publish a PR, change its status to "In Code Review" from the "Workflow" menu.
* When you merge a PR, change its status to "In Review" from the "Workflow" menu. This will indicate to the PO that the ticket will be available for review in a reference environment.
* When you merge a PR, update the "Fix Version/s" field to include the release that will include this change. Typically, this is the next major or minor version after the most recent release. If you don't have permission to create new versions within Jira, contact the

### Bugfest/patch release time

The normal status progression of a patch-release ticket is:
* Open
* In Progress
* In Code Review
* In Review
* Awaiting release (by PO)
* Awaiting deployment (by dev)
* In bugfix review (by dev or devops)
* Closed (by PO)

### Jira Tips

* Type `.` to bring up the Actions menu
* Type `?` to display keyboard shortcuts
* Link to other Jiras by their slugs only, e.g. `UIFOO-123`, not their full URLs, e.g. `https://issues.folio.org/browser/UIFOO-123`.
* Create a search-engine shortcut in Chrome so you can type, e.g. `j uiu-1055` and be redirected to https://issues.folio.org/browse/UIU-1055
** visit the URL `chrome://settings/searchEngines`
** in the “Other search engines” section, click the “Add” button
** enter a nickname like Folio Jira in the “Search Engine” field
** enter the keyword like j or jira in the “Keyword” field; this will be the value you enter to trigger this search engine
** enter `https://issues.folio.org/browse/%s` in the “URL with %s in place of query” field
** click the “Add” button
