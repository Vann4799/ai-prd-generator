# Shelf PRD

## 1. Project Overview
- **Project Name**: Shelf
- **Type**: desktop app
- **Description**: Point-of-sale and stock book for single-store grocery shops that lose sales when the internet drops.
- **Version**: 0.1
- **Date**: 2026-09-28
- **Author**: Vann4799

## 2. Problem Statement
Small grocery stores ring up sales in a notebook and reconcile stock once a week,
so the owner discovers a stockout only when a customer asks for the item. The
workaround costs roughly an hour of counting every Sunday and an unknown number
of lost sales in between. Cheap POS apps exist but stop working offline, which
is exactly when the queue is longest.

## 3. Target Users
- **Primary**: store owner, 30-55, comfortable with a phone but not with spreadsheets
- **Secondary**: one cashier per shift, often a family member
- **Count**: 1-3 people per store, 40 stores in the first year
- **Needs**: sell in three taps, see what is running out before it runs out
- **Goals**: stop losing sales to stockouts without learning new software

## 4. Features

### Must-Have (P0)
- [ ] Barcode checkout
- [ ] Offline sales queue

### Should-Have (P1)
- [ ] Low-stock alerts

### Nice-to-Have (P2)
- [ ] Supplier price history

### Out of Scope
- Multi-store sync in this version

## 5. User Stories

### Barcode checkout
- **As a** cashier
- **I want** to scan an item and see the running total immediately
- **So that** a queue of five people clears in under two minutes

### Offline sales queue
- **As a** store owner
- **I want** sales recorded while the internet is down and synced later
- **So that** a provider outage never stops the register

## 6. Acceptance Criteria

### Barcode checkout
- Given an item exists in the stock book, when the cashier scans its barcode, then the item and price appear on the sale screen within one second.

### Offline sales queue
- Given the network is unreachable, when a sale is completed, then the sale is stored locally and marked pending, and it uploads without manual action once the network returns.

## 7. Technical Requirements
- **Tech Stack**: Electron + SQLite, single machine per store
- **Platform**: Windows 10 or later, 4 GB RAM minimum
- **Dependencies**: none at runtime; sync uses the store API when reachable
- **Performance**: scan-to-total under 1 s on the minimum hardware

## 8. Success Metrics
- **Stockout-driven lost sales** — measured by owner's weekly count, target down 50% in 3 months
- **Checkout time** — measured by timed observation, target under 2 min for 5 items
- **Weekly counting time** — measured by owner log, target under 15 min

## 9. Timeline
- **Phase 1 (weeks 1-4)**: stock book import and barcode checkout
- **Phase 2 (weeks 5-8)**: offline queue and sync
- **Launch**: week 10, three pilot stores

## 10. Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Owners distrust automatic stock counts | high | show every adjustment with its sale receipt, printable |
| Barcode labels missing on loose goods | medium | weight and name lookup as a fallback path |
| Sync conflicts after long outages | medium | last-write-wins per sale id, conflicts listed for review |

## 11. Non-Technical Summary
Shelf is a cash register and stock book in one program for small grocery
stores. It works even when the internet is down, so a bad connection never
stops a sale. The owner can see which items are about to run out before
customers notice. At the end of the week the counting that used to take an
hour takes minutes. Nothing needs to be installed in the cloud or paid for
per month.
