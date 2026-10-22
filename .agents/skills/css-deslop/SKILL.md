---
name: css-deslop
description: Clean up CSS code slop
---

Check the current branch git diff against main. Review every changed `.tsx` file and every `.scss` file imported. Identify fixes based on the following instructions. Flag fixes that may alter rendered output. Apply the remaining fixes.

- Remove redundant declarations that duplicate parent/component behavior
- Remove rules or selectors with no matching `className` in the `.tsx`, or `classNames` with no matching rule in the repo
- When 3+ selectors share the same body, or differ by only one declaration's value, collapse them into one shared class (or a component prop, if one exists). Override only the varying value at the call site.

Also ensure all style rules below are followed:

```
# CSS Styles

- Do not use the `style` prop or write raw utility/atomic class strings in `className`
- Do not re-state styles the target component or its parent stack already set
- Use design-system props exposed by components instead of a new declaration. For any styling that component props can't express, add a BEM class in PascalCase: `Layer__ComponentName__Element--modifier`
- Put component rules in a side-effect imported `.scss` file with camelCased component name: `componentName.scss`
- Use the following spacing scale: (`4xs|3xs|2xs|xs|sm|md|lg|xl|2xl|3xl|5xl`)

## CSS Selectors

- Write each block and element as its own flat, top-level selector (`.Layer__ComponentName__Element { … }`); never build class names with `&__`, so the full name stays greppable. Nest only modifiers of the selector you are already in: attribute selectors, pseudo-classes, pseudo-elements, and media queries. See `src/styles/SKILL.md`.
- Only use descendant combinator selectors when the element can't own a class.
- Do not target another component's internal classes. Instead, add a prop or exposed class to that component
```

Report at the end with a summary of what you changed.

