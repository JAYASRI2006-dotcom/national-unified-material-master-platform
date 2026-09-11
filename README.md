# National Unified Material Master Platform (NUMMP)

"One Nation – One Material Code" — a working prototype that detects duplicate,
near-duplicate, and functionally-equivalent material records across multiple
CPSEs and generates a Common National Material Code (NMC) while preserving
mappings back to the original CPSE codes.

This is a **frontend-only prototype**: all data, matching logic, and workflow
state live in the browser (React state). There is no backend or database yet
— see "Next steps" below for how this maps to the full production stack.

## Run it

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

To build a static production bundle:

```bash
npm run build
npm run preview
```

## What's inside

- `src/App.jsx` — the entire application: layout, pages, and the matching
  engine.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind directives + small global styles.
- Demo data for 3 fictional CPSEs (Bharat Energy Corporation, National Steel
  Industries, Indian Mining Corporation) with ~38 material records and
  ~12 intentional duplicate/near-duplicate groups, pre-loaded in `App.jsx`.

## How the matching engine works (prototype heuristic)

Real semantic matching would use Sentence Transformers + cosine similarity
(see stack below). To keep this prototype dependency-free and runnable
entirely in the browser, the matching engine instead combines:

- **Word-level Jaccard similarity** on normalized, abbreviation-expanded text
  (`SS` → `stainless steel`, `MM` → `mm`, `MTR` → `meter`, etc.)
- **Character bigram Dice coefficient** to tolerate word-order and phrasing
  differences
- **Extracted numeric specification tokens** (`M10`, `50mm`, `2.5sqmm`, …)
  compared directly, since dimensional agreement is a strong signal for
  physical materials
- A small same-category boost

The blended score (0–100%) drives match type classification (Exact Duplicate
/ Near Duplicate / Functionally Equivalent) and can be tuned live via the
threshold slider on the AI Matching and Settings pages.

## Features implemented

- Multi-CPSE data view (Material Upload page; drag-and-drop UI is wired up,
  file parsing is simulated — see Next steps)
- Data standardization rules (unit/abbreviation normalization)
- AI material matching with similarity scoring across all CPSE pairs
- Duplicate Detection workflow: Approve / Reject / Review Later
- Common National Material Code generation (`NMC-000001`, …) via union-find
  clustering over approved matches, with a mapping tree view
- Editable AI-recommended standardized description per National Code group
- Material classification display by category
- Dashboard with stat cards and charts (materials by CPSE, duplicate stats,
  materials by category, before/after consolidation)
- Material Search across name, code, NMC, CPSE, and category
- Approval Center for items marked "Review Later"
- Audit Trail logging uploads, approvals, rejections, and standardizations
- Role selector (Admin / Data Analyst / Reviewer) that gates approval actions
- Dark / light mode

## Next steps to reach the full target stack

This prototype is built to make the real backend a drop-in replacement:

1. **FastAPI backend** — expose endpoints mirroring the current client-side
   functions: `POST /materials/upload`, `GET /materials`, `POST /match/run`,
   `POST /matches/{id}/decision`, `GET /codes`, `POST /codes/{id}/standardize`,
   `GET /audit`.
2. **PostgreSQL** — tables for `materials`, `cpses`, `match_candidates`,
   `national_codes`, `code_mappings`, `audit_log`.
3. **AI matching service** — replace `computeSimilarity()` in `App.jsx` with
   an API call to a Python service using Sentence Transformers embeddings +
   cosine similarity (scikit-learn), keeping the same 0–100 score contract so
   the frontend needs no changes beyond swapping the data source.
4. **Real file parsing** — wire the upload dropzone to actually parse CSV/XLSX
   (e.g. with `papaparse` / `xlsx` client-side, or server-side with pandas)
   instead of the current simulated row-count.
5. **Auth** — replace the role dropdown with real authentication and
   role-based access control.
