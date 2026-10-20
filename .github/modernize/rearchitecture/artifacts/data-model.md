# Data Model

The project has no persistence layer, ORM or database schema. Its durable application data is limited to:

- `projectsData`: static project objects containing id, title, category, description, problem, solution, stack, metrics, image and demo URL.
- Contact request payload: name, email, optional phone/company/service and message.
- Estimate request payload: solution type/label, feature arrays, numeric estimate and contact object.
- Runtime configuration: SMTP credentials and port from environment variables.

No database redesign is applicable. The request payloads are external contracts and are documented in `wire_contracts.yaml`.
