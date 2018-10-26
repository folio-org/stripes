# Depending on unreleased features

<!-- md2toc -l 2 depending-on-unreleased-features.md -->
* [The problem](#the-problem)
* [The solution](#the-solution)
* [Caveat: generating CI version numbers](#caveat-generating-ci-version-numbers)
* [Open questions](#open-questions)


## The problem

We frequently find that fixing a front-end bug, or adding a front-end feature, requires changes in two or more NPM packages: typically, a Stripes module such as Users or Inventory, together with a supporting library such as stripes-core or stripes-components.

For example the Codex Search application's new feature [UISE-41 (When starting the Codex Search UI, do not search for cql.allRecords=1)](https://issues.folio.org/browse/UISE-41) required a new facility
[STCOM-181 (boolean argument for makeQueryFunction: whether to reject an empty query)](https://issues.folio.org/browse/STCOM-181).

In these circumstances we would like to express that the higher level package depends on the existence of the new feature in the lower-level: in this case, the version of ui-search that does not make an initial search for all records depends on a version of stripes-smart-components whose `makeQueryFunction` provides the necessary underlying "reject empty query?" argument. The obvious way to do this would be to make a new release of the low-level package and make the high-level module depend on it. But releasing UI packages is [a non-trivial process](release-procedure.md) and we do not want to do this for each newly added feature.


## The solution

The proposed solution involves two steps.

1. Use the FOLIO CI NPM repository that provides builds of merged commits, rather than the regular FOLIO repository that provides formal releases: `yarn config set @folio:registry https://repository.folio.org/repository/npm-folioci/`

2. Increment the patch-level in a module's version number whenever you add a new feature: for example, if you are working on stripes-smart-components and its `package.json` specifies `"version": "1.4.7"`, increment this to `"1.4.8"`.

Then the module that uses the new facility can increase its dependency on stripes-smart-components to require at least the patch-level that provides the necessary functionality.


## Caveat: generating CI version numbers

Once we start using the patch-level in this way, it may not interact well with how the CI system generates package identifiers -- because it, too, uses the patch-level. It generates unique NPM version numbers by combining a serial number to the version number from the package file. Depending on exactly how this is done, it may yield incorrect ordering.

Consider stripes-smart-components version 1.4.9, when a feature is added and it rolls over to version 1.4.10. This orders correctly: version 1.4.10 > 1.4.9 because each facet is compared numerically, not lexically.

If CI version numbers are made simply by blindly concatenating `000` and the serial number, then we will get versions 1.4.9000123 and 1.4.10000124, and the latter will rightly sort as greater than the former.

But if instead CI version numbers are made by padding the patch-level out to four digit with zeroes and appending the serial number, then we will get versions 1.4.9000123 and 1.4.1000124, and the latter will wrongly sort as less than the former.

Similarly, consider the serial number rolling over from 99 to 100. If the serial number is merely appended to the patch-level and a string of zeroes, then we will have versions 1.4.900099 and 1.4.9000100, and again the latter will wrongly sort as less than the former.

**Conclusion**: the CI version number must be formed by setting the serial number in a fixed-width zero-padded number, and blindly appending that to the patch-level irrespective of how many digits it has. In Perl, `$patchlevel . sprintf("%05d", $serial)`. This generates the right sequences as both the patch-level and serial-number roll over into an additional digit:

	$ cat generate-ci-version.pl
	for (my $patchlevel = 9; $patchlevel <= 10; $patchlevel++) {
	    for (my $serial = 99; $serial <= 100; $serial++) {
	        my $ci = $patchlevel . sprintf("%05d", $serial);
	        print "CI version $ci\n";
	    }
	}
	$ perl generate-ci-version.pl
	CI version 900099
	CI version 900100
	CI version 1000099
	CI version 1000100
	$


## Open questions

* Would it be good practice, in the `CHANGELOG.md` entry for each new feature, to state the patch-level at which it became available?

