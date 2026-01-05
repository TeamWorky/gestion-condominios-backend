# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.7.3, Node.js 24.11.1  
**Primary Dependencies**: NestJS 11.0.1, TypeORM 0.3.28, PostgreSQL, Redis  
**Storage**: PostgreSQL (TypeORM), Redis (caché y colas)  
**Testing**: Jest 30.0.0, ts-jest 29.2.5, Supertest 7.0.0  
**Target Platform**: Linux server (Node.js runtime)  
**Project Type**: Backend API (RESTful)  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, <200ms p95 response time or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, rate limiting 100 req/min, JWT token expiration or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, concurrent connections, data volume or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── [feature-name]/              # Nuevo módulo de feature
│   ├── dto/                     # DTOs (create, update)
│   ├── entities/                # Entidades TypeORM
│   ├── [feature-name].controller.ts
│   ├── [feature-name].service.ts
│   ├── [feature-name].service.spec.ts  # Tests unitarios
│   └── [feature-name].module.ts
│
├── common/                       # Componentes compartidos existentes
│   ├── decorators/
│   ├── dto/
│   ├── entities/
│   ├── enums/
│   ├── exceptions/
│   └── validators/
│
└── [otros módulos existentes]    # auth, users, email, logger, etc.
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
