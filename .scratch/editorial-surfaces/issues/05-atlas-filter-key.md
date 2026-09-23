# 05: Atlas filters read as the map's key

Spec: [../spec.md](../spec.md)

**What to build:** the Atlas filter bar becomes a quiet ruled line above the plate: search, each facet as a disclosure button opening a menu of options (React Aria), the ready-only toggle, the live count, and Clear; no native selects on desktop. The mobile filter sheet keeps working. URL parameters and filter semantics unchanged.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Each facet from the model is a menu button showing its current choice; choosing updates the plate, list, count, and URL as before
- [x] Fully keyboard operable; the count is announced; focus returns to the button on close
- [x] Existing Atlas tests pass unchanged in behaviour; new tests drive the menus by keyboard
- [x] DESIGN.md's Atlas section replaced in place
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
