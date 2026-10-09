# Reading dependent repos' docs

> Which repo depends on which, and the rule that a task reads the docs of every repo it depends on.
>
> Status: accepted · Version 1

## The rule

Before changing code in a repo, read that repo's `AGENTS.md` and its own `docs/`, then the docs of every repo it depends on. The library you call is the contract you must not break, so its docs are required reading. Nothing flows the other way: a lower repo never reads its consumers.

## Who depends on whom

| Repo | Depends on |
|---|---|
| `common` | nothing |
| `react-ui` | `common` |
| `nexus` | `common`, `react-ui` |
| `mxdb` | `common`, `react-ui` |
| `vision` | `common`, `react-ui`, `nexus`, `mxdb` |

## How it is wired

- Each repo's `AGENTS.md` names the docs of the repos it depends on, so the list is not repeated in every doc.
- Changing a contract in a lower repo opens the docs of its consumers in the same change.
- A doc lives in the repo that owns the thing it describes. This repo (`agents`) holds only rules that apply to every repo — never one repo's API, file paths, tools or environment.
