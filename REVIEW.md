# Code review instructions

Review each pull request against this repo's written conventions. The files below are the source of truth. This file tells you how to apply them to a diff. It does not restate them.

## Read before you review

1. Read [`AGENTS.md`](AGENTS.md) in full. Every rule in these sections applies to the diff:
   - **Working style** (reuse before adding, comments, no recreated files, dependency changes, PR template)
   - **Import boundaries**
   - **Non-negotiables**
   - **Things to avoid**
   - **Useful abstractions**
   - **TypeScript and imports**
   - **Lint style rules** (only the comment rule; lint enforces the rest)
   - **Publishing** (a new export from `src/index.tsx` is a public API change)
2. For each changed file, read the colocated `SKILL.md` for its area. The table in **Where to read before you write** in `AGENTS.md` maps each area to its `SKILL.md`. Also read [`src/SKILL.md`](src/SKILL.md) if the diff moves code between directories or adds an import across layers or feature domains.
3. Read [`.augment/rules/code-review.md`](.augment/rules/code-review.md). It holds the rule-by-rule review checklist and the list of files to ignore. [`.cursor/BUGBOT.md`](.cursor/BUGBOT.md) has the same rules.
4. If the diff touches an area that has a skill in [`.agents/skills/`](.agents/skills/), read that `SKILL.md`.

## What to flag

- Flag each place where the diff breaks a rule from the files above. Cite the rule's file and section in the finding, for example `src/hooks/api/SKILL.md` or `AGENTS.md › Non-negotiables`.
- Flag correctness bugs, even if no rule names them. Pay special attention to the four properties that every component needs: themeable, localizable, responsive, and mountable more than once on a page.
- Flag new code that duplicates an existing component, hook, schema, or util. Name the existing one.
- Flag a new export from `src/index.tsx` that the PR description does not call out.
- Flag a PR description that does not follow [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
- If the diff changes a convention, check that the PR also updates the `AGENTS.md` or `SKILL.md` that owns that convention.

## What not to flag

- Do not flag agent workflow rules. Examples: work in phases, pause for guidance, and run typecheck before you hand back work. These rules control how an agent works, not what the code contains.
- Do not flag what `eslint.config.mjs`, `stylelint.config.mjs`, or `tsc --noEmit` already rejects.
- Do not review the paths that `.augment/rules/code-review.md` lists under **Files to ignore**.
- Do not flag code that the diff does not change, unless the diff makes it wrong.
- Do not flag hypothetical edge cases that need an unrealistic input or state. Give the concrete failure for each correctness finding.

## How to report

- Rank findings from most to least severe.
- For each finding, give the file and line, the rule or failure, and the smallest fix.
- If a finding is a judgment call, label it as a suggestion.
