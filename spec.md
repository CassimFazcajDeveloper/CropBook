# SPEC: Crop Farm Manager (React Native + TypeScript) app name Saad CropBook

## Goal
An offline Android app for managing a small crop farm: track input costs, activity costs, harvests and sales per crop, plus a simple Profit First money allocation system. Single user, no login, no internet needed.

## Target & Stack (fixed — do not propose alternatives)
- Device: Samsung Galaxy A series or any good android phone compatible. Android only; ignore iOS-specific work.
- Expo (latest SDK, managed workflow) + TypeScript in strict mode.
- Navigation: expo-router (file-based); material top tabs on the crop detail screen.
- UI: React Native Paper (Material 3 theme) shadcn feel.
- Storage: expo-sqlite with a small typed repository layer. No ORM.
- State: Zustand stores that read from and write to the repository.
- Dates: @react-native-community/datetimepicker. Formatting: plain `Intl` or small helpers (no moment.js).
- No backend, no Firebase, no auth, no Redux.
- Currency: Malawi Kwacha, displayed as `MK 12,500` (no decimals unless non-zero). Dates as `15 Oct 2026`.

## Core Concept
Everything is organised by **crop**. Each crop has the same four sections: Inputs, Activities, Harvests, Sales. Adding a new crop gives it all four sections automatically (they are just rows linked by `cropId`, not per-crop tables).
- Default crops seeded on first launch: **Tomatoes, Onions, Maize**.
- The user can add, rename and delete crops. Deleting a crop asks for confirmation and removes its records.

## Data Model (SQLite tables + matching TS types in `src/types.ts`)
- crops: id, name, emoji, createdAt
- input_purchases: id, cropId, item (e.g. seed, fertiliser, pesticide), quantity, unit, cost, datePurchased, note
- activities: id, cropId, type (Land tilling, Planting, Irrigation, Weeding, Spraying, Fertiliser application, Harvesting labour, Other), description, cost, date, note
- harvests: id, cropId, date, quantity, unit (kg, bags, crates, pails), note
- sales: id, cropId, date, quantity, unit, pricePerUnit, total (computed), buyer (optional), note
- accounts: id, name, targetPercent, sortOrder
- allocations: id, accountId, amount, date, saleId (nullable), note
- Store money as integers (whole kwacha). Store dates as ISO strings. Run migrations from a `user_version` check.

## Screens
1. **Home / Dashboard**
   - Totals across all crops: Sales, Costs (inputs + activities), Net (sales − costs).
   - Profit First summary: total generated, put back into the farm (Operations), paid to me (My Salary), Profit.
   - A grid of crop cards (emoji, name, net for that crop), with a "+ Add crop" card.
2. **Crop Detail** (`/crop/[id]`): a header with this crop's Sales / Costs / Net, and top tabs: **Inputs | Activities | Harvest | Sales**. Each tab shows a list (newest first) with a running total, a FAB to add, tap to edit, long-press to delete (with an undo snackbar).
3. **Add/Edit forms**: modal screens or bottom sheets with numeric keyboards for money/quantity fields, a date picker defaulting to today, and validation.
4. **Profit First / Accounts**
   - 4 accounts, seeded: **Operations** (50%), **Profit** (10%), **My Salary** (30%), **Tax & Reserve** (10%). Names and percentages are editable; percentages must total 100%.
   - "Allocate sale" flow: pick a sale (or enter an amount), the app suggests a split by percentage, and the user can adjust before saving.
   - Each account shows its balance and allocation history.
   - Show "Unallocated sales" = total sales − total allocations.

## Design
Simple and beautiful: Material 3 via React Native Paper, earthy green primary palette, rounded cards, big readable numbers, light and dark mode that follows the system. Use 🍅 🧅 🌽 as the default crop icons, with an emoji picker when adding a crop. Show empty states with a short hint instead of blank screens.

## Project Structure
`app/` (routes), `src/db/` (schema, migrations, repositories), `src/stores/`, `src/components/`, `src/utils/` (currency, dates), `src/theme.ts`, `src/types.ts`.

## Working Rules (save tokens)
- Don't ask clarifying questions; make sensible choices and list any assumptions in one short line at the end.
- Build in phases. After each phase, run `npx tsc --noEmit`, fix errors, then continue without waiting for me:
  1. Expo scaffold, theme, SQLite schema, migrations, seeding
  2. Dashboard + crop CRUD
  3. Crop Detail with Inputs and Activities
  4. Harvest and Sales
  5. Profit First accounts and allocation
  6. Polish (empty states, formatting, dark mode) + APK build config
- Use `npx expo install` for dependencies so versions match the SDK.
- No unit tests, README, or comments explaining obvious code unless I ask.
- Don't print whole files back to me. After each phase, give at most a 3-line summary.
- At the end, add an `eas.json` with a `preview` profile that outputs an APK (`"buildType": "apk"`), and tell me the exact commands to build and install it.