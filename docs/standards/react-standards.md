# React standards

> React rules: one component per file, no inline JSX callbacks, styles, maps or object props.
>
> Status: accepted · Version 1

## React-specific preferences

- **One component per file**: extract sub-components into sibling files.
- **No inline functions in JSX**: use `useBound` for event and callback handlers; `useCallback` only when memoisation semantics are specifically required.
- **No inline styles or objects**: never `style={{ ... }}` — define styles as constants or in `createStyles`. No inline object or array literals as props; use `useMemo`.
- **No inline `.map()` in JSX**: compute rendered items via `useMemo` and reference the result.
- **Extract data logic into hooks**: the component handles layout; a local `use*` hook handles derived data.
- **Extract self-contained UI**: anything with its own state, logic or styling becomes a standalone component file.
- **`useOnMount` ignores any returned cleanup** (`@anupheaus/react-ui`): it runs inside a `useEffect` without propagating teardown, so a returned cleanup function leaks. For listeners and subscriptions, store the handle in a `useRef` and remove it in `useOnUnmount` (`NetworkStatusProvider` is the reference implementation). Use `useOnChange` to react to dependency changes after mount.
