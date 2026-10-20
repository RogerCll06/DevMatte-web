# Architecture Index

This index is not the full contract. Do not implement from this file alone; follow the artifact paths below.

## Implementation Guide

### Global artifacts
- `unit_graph.yaml` — unit boundaries, entrypoints, dependencies and exported browser/API surfaces.
- `shared_modules.yaml` — shared DOM/data/config modules and their current responsibilities.
- `wire_contracts.yaml` — HTTP and Calendly contracts that must remain compatible.
- `cross_unit_state.yaml` — browser state shared through DOM, globals and modal classes.
- `migration_boundary.yaml` — files in scope for this reorganization and files intentionally copied as-is.

### Unit: landing-page
- external trigger: `GET /`
- must read `units/landing-page/behavior.yaml`, `units/landing-page/bindings.yaml` and `units/landing-page/unit_decomposition.yaml`.
- use for: HTML composition, responsive navigation, animation and contact-form handoff.

### Unit: portfolio-cases
- external trigger: click on `#portfolio-grid` project card.
- must read `units/portfolio-cases/behavior.yaml`, `units/portfolio-cases/bindings.yaml` and `units/portfolio-cases/unit_decomposition.yaml`.
- use for: project data, card rendering and project detail modal.

### Unit: booking
- external trigger: click on `.btn-schedule`.
- must read `units/booking/behavior.yaml`, `units/booking/bindings.yaml` and `units/booking/unit_decomposition.yaml`.
- use for: lazy Calendly iframe, focus restoration and modal lifecycle.

### Unit: estimator
- external trigger: submit `#estimator-form`.
- must read `units/estimator/behavior.yaml`, `units/estimator/bindings.yaml` and `units/estimator/unit_decomposition.yaml`.
- use for: wizard state, calculation, validation and `/api/estimate` request.

### Unit: server-api
- external trigger: `POST /api/contact` or `POST /api/estimate`.
- must read `units/server-api/behavior.yaml`, `units/server-api/bindings.yaml` and `units/server-api/unit_decomposition.yaml`.
- use for: request validation, HTML escaping, SMTP delivery and error contracts.

Before DONE report: artifacts read, preserved contracts, unresolved/deferred contracts, and build/runtime evidence.
