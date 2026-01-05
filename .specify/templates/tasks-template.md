---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

**NestJS Backend Structure:**
- Source code: `src/[module-name]/`
- Tests: `src/[module-name]/[file].spec.ts` (co-located with source)
- DTOs: `src/[module-name]/dto/`
- Entities: `src/[module-name]/entities/`
- Controllers: `src/[module-name]/[module].controller.ts`
- Services: `src/[module-name]/[module].service.ts`
- Modules: `src/[module-name]/[module].module.ts`
- Common: `src/common/` (decorators, dto, entities, enums, exceptions, validators)

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Note**: Para este proyecto NestJS, la mayoría de la infraestructura ya existe. Solo incluir tareas si se necesita algo nuevo.

Examples of foundational tasks (adjust based on your project):

- [ ] T004 [P] Create database migration for new tables (if needed)
- [ ] T005 [P] Setup new authentication/authorization guards (if needed)
- [ ] T006 [P] Create base entities that all stories depend on (if needed)
- [ ] T007 [P] Configure new error handling or logging (if needed)
- [ ] T008 [P] Setup new environment variables (if needed)
- [ ] T009 [P] Create shared DTOs or utilities in src/common/ (if needed)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit tests for [Service] in src/[module]/[module].service.spec.ts
- [ ] T011 [P] [US1] E2E tests for [endpoint] in test/[module].e2e-spec.ts

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create [Entity] entity in src/[module]/entities/[entity].entity.ts (extends BaseEntity)
- [ ] T013 [P] [US1] Create DTOs in src/[module]/dto/ (create-[entity].dto.ts, update-[entity].dto.ts)
- [ ] T014 [US1] Implement [Module]Service in src/[module]/[module].service.ts (depends on T012, T013)
- [ ] T015 [US1] Implement [Module]Controller in src/[module]/[module].controller.ts
- [ ] T016 [US1] Create [Module]Module in src/[module]/[module].module.ts
- [ ] T017 [US1] Register module in src/app.module.ts
- [ ] T018 [US1] Add validation decorators to DTOs (class-validator)
- [ ] T019 [US1] Add API documentation decorators (@ApiProperty, @ApiTags)
- [ ] T020 [US1] Add error handling and logging

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T021 [P] [US2] Unit tests for [Service] in src/[module]/[module].service.spec.ts
- [ ] T022 [P] [US2] E2E tests for [endpoint] in test/[module].e2e-spec.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Create [Entity] entity in src/[module]/entities/[entity].entity.ts
- [ ] T024 [P] [US2] Create DTOs in src/[module]/dto/
- [ ] T025 [US2] Implement [Module]Service in src/[module]/[module].service.ts
- [ ] T026 [US2] Implement [Module]Controller in src/[module]/[module].controller.ts
- [ ] T027 [US2] Create [Module]Module and register in app.module.ts
- [ ] T028 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T029 [P] [US3] Unit tests for [Service] in src/[module]/[module].service.spec.ts
- [ ] T030 [P] [US3] E2E tests for [endpoint] in test/[module].e2e-spec.ts

### Implementation for User Story 3

- [ ] T031 [P] [US3] Create [Entity] entity in src/[module]/entities/[entity].entity.ts
- [ ] T032 [P] [US3] Create DTOs in src/[module]/dto/
- [ ] T033 [US3] Implement [Module]Service in src/[module]/[module].service.ts
- [ ] T034 [US3] Implement [Module]Controller in src/[module]/[module].controller.ts
- [ ] T035 [US3] Create [Module]Module and register in app.module.ts

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update API documentation in Scalar (Swagger decorators)
- [ ] TXXX [P] Code cleanup and refactoring
- [ ] TXXX [P] Performance optimization (Redis caching, query optimization)
- [ ] TXXX [P] Additional unit tests to improve coverage
- [ ] TXXX [P] Security hardening (guards, validators, rate limiting)
- [ ] TXXX [P] Update README.md with new feature documentation
- [ ] TXXX [P] Run quickstart.md validation
- [ ] TXXX [P] Verify all tests pass: `npm test`
- [ ] TXXX [P] Check coverage: `npm run test:cov`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
