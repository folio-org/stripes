_Last Updated: (2026-04-20)_
_Last Reviewed: (2026-04-20)_

## Overview

The purpose of this form is to disclose the types of personal data[^1] (PD) stored by each module.  This information enables those hosting FOLIO to better manage and comply with various privacy laws and restrictions, e.g. GDPR.

It's important to note that PD is not limited to that which can be used to identify a person on its own (e.g. Social security number), but also data used in conjunction with other data to identify a person (e.g. date of birth + city + gender, or dynamic IP address + date + time), and any information about such a person (e.g. has loaned 5 items, 2 of which are overdue).

For the purposes of this form, "store" includes the following:

* Persisting to storage - Either internal (e.g. Postgres) or external (e.g. S3, etc.) to FOLIO
* Caching - In-memory, etc.
* Logging
* Sending to an external piece of infrastructure such as a queue (e.g. Kafka), database (e.g. Elasticsearch, Library Data Platform), distributed table, etc.

## Personal Data processed by this Module

- [x] This module does not store any PD.
- [x] This module does not process any PD.
- [ ] This module provides [custom fields](https://github.com/folio-org/folio-custom-fields).
- [ ] This module stores fields with free-form text (tags, notes, descriptions, etc.)
- [ ] This module caches PD
- [ ] This module logs PD
  - [ ] Log level ERROR includes PD
  - [ ] Log level WARNING includes PD
  - [ ] Log level INFO includes PD
  - [ ] Log level DEBUG includes PD
- [ ] This module transmits PD (including queues, additional databases, etc.)

---

### Identifiable information

- [ ] Passport number / National identification numbers
- [ ] Driver’s license number
- [ ] Social security number
- [ ] Financial account information

### Identifiable information if linked

Information can be combined with others to form a person’s identity.

- [ ] First name
- [ ] Last name
- [ ] Gender
- [ ] Date of birth
- [ ] Place of birth
- [ ] Racial or ethnic origin
- [ ] Address
- [ ] Location information
- [ ] Geolocation data
- [ ] Phone number(s)
- [ ] Pseudonym / Alias / Nickname
- [ ] Username / User Identifier (UUID)
- [ ] Email address
- [ ] Financial information / Fees or Fines
- [ ] Circulation transaction(s)
- [ ] Web cookies
- [ ] IP address / MAC address
- [ ] Photographs of users (profile picture)
<!--- - [ ] Other PD - Please list as needed -->

**NOTE** This is not intended to be a comprehensive list, but instead provides a starting point for module developers/maintainers to use. If needed, append additional lines and check those accordingly.

## Privacy Laws, Regulations, and Policies

Numerous laws and policies were considered when creating the list of personal data fields above.  For additional information, please refer to the following:
* [General Data Protection Regulation (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02016R0679-20160504)
  * [What are identifiers and related factors? (ico.org.uk)](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/what-is-personal-data/what-are-identifiers-and-related-factors/)
  * [What is the meaning of 'relates to'? (ico.org.uk)](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/what-is-personal-data/what-is-the-meaning-of-relates-to/)
  * [Opinion 4/2007 on the concept of personal data (Article 29 working party)](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2007/wp136_en.pdf)
* [California Consumer Privacy Act (CCPA)](https://oag.ca.gov/privacy/ccpa)
* [U.S. Department of Labor: Guidance on the Protection of Personal Identifiable Information](https://www.dol.gov/general/ppii)
* Cybersecurity Law of the People's Republic of China
  * https://www.newamerica.org/cybersecurity-initiative/digichina/blog/translation-cybersecurity-law-peoples-republic-china/
  * http://en.east-concord.com/zygd/Article/20203/ArticleContent_1690.html
* [Personal Data Protection Bill, 2019 (India)](https://www.prsindia.org/billtrack/personal-data-protection-bill-2019)
* [Data protection act 2018 (UK)](https://www.legislation.gov.uk/ukpga/2018/12/section/3/enacted)

---
[^1]: Personal data is "any information relating to an identified or identifiable natural person". [GDPR Article 4](https://web.archive.org/web/20220308161519/https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679#d1e1374-1-1)

v1.1
