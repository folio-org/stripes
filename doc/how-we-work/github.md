## How to GitHub

### Before you push

* Begin your commit subject with the Jira ticket you are working on, e.g. `UIFOO-123`.
* Use the imperative case in your commit subject, i.e. it should complete the sentence, "After this PR, the code will ..."
* Describe _why_ you are making these changes in the commit body. It is not sufficient to simply link to the Jira issue. If you are adding a feature then briefly describe it; one sentence is fine as long as it highlights the key changes. If you are fixing a bug, describe the bug, describe how you think it got there, and most importantly, describe how the change resolves the bug.
* Finish your commit with a reference to any relevant Jira tickets (e.g. `UIFOO-987`) or PRs (e.g. `#357`).

### After you push

* Link the Jira issue in the commit body to Jira using Markdown.
* If your repository does not have a `CODEOWNERS` file to automatically tag reviewers, tag the [dev lead](https://wiki.folio.org/display/REL/Team+vs+module+responsibility+matrix) and any other folks you think are relevant. Generally, you should have at least one approving review before you merge. If you are fixing something trivial like a typo or a minor lint gripe, don't worry about approvers; use your judgement.
* Do not `git push --force` to a branch you have already pushed to GitHub; you can clean up the history by squashing commits when you merge. Force pushes are especially disruptive when there are comments on a PR that become detached from commits that are removed because it destroys the thread of the conversation.

### When you merge

* Make sure the commit subject starts with a single Jira issue, e.g. `UIFOO-123 ...`. Release scripts may parse commit subject lines in order to keep Jira and GitHub in sync.
* Choose "Squash and merge". This preserves the history of your work if there were multiple commits while also making it simple to cherry-pick the work to a release branch if necessary.

### Other notes

* GitHub and Jira can only interact if Jira issues are correctly linked using `UIFOO-123`. The following do not work: `UIFOO 123`, `UIFOO: 123`, `UIFOO.123`.
* If your ticket is from one project (e.g. `UIFOO`) and your commit will be in a different project (e.g. `stripes-bar`), STOP. If the ticket was created in the wrong repository, move it to the correct one (i.e. the one that will contain the commit). If the ticket is in an app project (e.g. `UIFOO`) but the fix will be in a library repository (e.g. `stripes-bar`), either (a) clone the ticket into the correct project or (b) create a new ticket in the correct project and link it to the original. POs use Jira to track what happens in each release of a project. They cannot do this unless they have corresponding tickets.
* If a CI/CD check fails unexpectedly (e.g. you think the failure is due to some transient reason unrelated to the commits) re-run that check directly in Jenkins. Click the "Details" link, then the "Login" button (top right), then the circle-arrow ("Rerun") icon. This can happen due to flaky tests, or problems with dependency resolution, or any number of reasons.
