---
status: accepted
supersedes:
  - ADR-0003
  - ADR-0004
---

# Separate generic platform source from operator configuration and content

## Context

The codebase originated as a bespoke web application for Mas Bogeys Que Birdies (MBQB), a Chilean golf community. Domain-specific naming (`canchas`, `la-biblia-articles`, `bogeyficador`), Chilean RUT validation, hardcoded brand text, and bespoke editorial routes (`/convenios`, `/el-canal`, `/sobre-nosotros`) were originally embedded directly into the application source code. To release the project as an open-source community platform, the core platform architecture had to decouple from any specific operator's identity, terminology, and content.

This supersedes ADR-0003 (which established Chilean Spanish routes like `/canchas`) and ADR-0004 (which established Bogeyficador and Chilean RUT validation), while preserving the HMAC privacy-preserving lookup model.

## Decision

We genericized all core schemas, routes, and domain models into a reusable community platform:
- Renamed collections and routes from golf-specific terminology to generic domain language: `canchas` → `places`, `la_biblia_articles` → `articles`, `active_memberships` → `memberships`, `productos` → `products`, and `bogeyficador` → `verify`.
- Decoupled operator identity from the codebase by expanding the `site-settings` CMS global to configure `brandName`, `siteDescription`, `defaultLocale`, `lang`, and `memberIdentifierType` dynamically.
- Removed operator-specific static editorial routes from the core source, delegating them to CMS-managed pages or operator-specific deployment layers.
- Retained the privacy-preserving HMAC membership verification model while supporting generic identifier inputs alongside optional format validation (such as Chilean RUT).
- Preserved database continuity for existing deployments by squashing table and column renames into the baseline migration so existing operator data carries over cleanly.

## Consequences

The core repository contains zero golf-specific or brand-specific logic, enabling any community organization to self-host and customize the platform. Operators configure their identity, locale, and content entirely through the Payload CMS admin interface without modifying core platform code.
