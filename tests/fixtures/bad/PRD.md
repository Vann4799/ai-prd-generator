# Shelf PRD (broken on purpose)

## 1. Project Overview
- **Project Name**: Shelf
- **Type**: desktop app
- **Description**: Point-of-sale for small grocery stores.
- **Version**: [0.2]
- **Date**: 2026-09-28
- **Author**: Vann4799

## 2. Problem Statement
Owners count stock by hand every week and lose sales to stockouts.

## 3. Target Users
- **Primary**: store owner
- **Count**: 40 stores

## 4. Features

### Must-Have (P0)
- [ ] Barcode checkout
- [ ] Offline sales queue

### Out of Scope
- Multi-store sync

## 5. User Stories

### Barcode checkout
- **As a** cashier
- **I want** to scan items fast

## 6. Acceptance Criteria

### Offline sales queue
- Given no network, when a sale completes, then it is stored locally.

## 7. Technical Requirements
- **Tech Stack**: Electron + SQLite
- TODO: name the sync endpoint

## 8. Success Metrics
- **Lost sales** — measured weekly, target down 50%

## 9. Timeline
- **Phase 1 (weeks 1-4)**: checkout

## 11. Non-Technical Summary
Shelf is a cash register for small stores.
