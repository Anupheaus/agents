# Reading dependent repos' docs

> The rule that a task reads the docs of every repo it depends on, and where that dependency list lives.
>
> Status: accepted · Version 2

## The rule

Before changing code in a repo, read that repo's `AGENTS.md` and its own `docs/`, then the docs of every repo it depends on. The library you call is the contract you must not break, so its docs are required reading. Nothing flows the other way: a lower repo never reads its consumers.

## Where the dependency list lives

Each repo states its own dependencies in its overview doc, `docs/guides/repo-overview.md` — so `common`, `react-ui`, `nexus`, `mxdb` and `vision` each carry their own line. Do not keep a second master list here; it drifts.

## How it is wired

- Each repo's `AGENTS.md` names the docs of the repos it depends on, so the list is not repeated in every doc.
- Changing a contract in a lower repo opens the docs of its consumers in the same change.
- A doc lives in the repo that owns the thing it describes. This repo (`agents`) holds only rules that apply to every repo — never one repo's API, file paths, tools or environment.
