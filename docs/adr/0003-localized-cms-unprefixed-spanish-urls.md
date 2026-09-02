---
status: superseded by ADR-0005
---

# Support localized CMS fields with unprefixed Spanish URLs

Payload content models will support localization from version 1, but the public site will launch in Chilean Spanish using unprefixed routes like `/canchas` and `/articles`. This accepts some CMS schema complexity now to keep future language expansion possible, while avoiding `/es` URL noise before MBQB has a second public language.
