## 2024-05-14 - React.memo Component Signature Caution
**Learning:** In a codebase mapping standard UI components (like a Kanban board with many cards that render purely off object props), applying `React.memo` to deeply-nested sub-components is extremely effective. However, doing so requires careful regex/parsing when applying patches to not accidentally overwrite similar syntactic structures (like object literals `};`) when searching for component end brackets.
**Action:** Be extremely precise with patching function signatures in React to prevent syntax errors that break Vite/esbuild.
