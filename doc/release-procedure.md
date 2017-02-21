# Stripes release procedure

**XXX** THESE ARE NOTES IN PROGRESS.

The libraries that make up Stripes adhere to [the FOLIO
version-numbering scheme](http://dev.folio.org/community/contrib-code#version-numbers), which is essentially identical to [Semantic Versioning](http://semver.org/)

* Freeze the master for a short while
* Make a release branch
* Make changes specific for this release, if any, in the branch
* Increment version number
* Tag a version
* npm publish (get creds if needed)
* Users and Items need peer-dependency on newer stripes-connect
* stripes-core dependency?
* stripes-sample-platform dependency?

See http://dev.folio.org/doc/automation
