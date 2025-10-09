# Team's best practices

## Avoid having multiple index.ts files or one per component

Better to maintain a single index.ts file used for exporting components.

### Cons we're avoiding

Maintenance overhead - Every time we add/remove/rename something, we need to update the index file. This is the concern @sarahraines is raising.
Ambiguity in editors - When we have many tabs open, they all say "index.ts" making it harder to identify which file we're in.
Import cycles risk - Index files can make it easier to accidentally create circular dependencies.
Not always necessary - For simple components with a single file, an index.ts adds extra ceremony without much benefit.
Debugging confusion - Stack traces and errors pointing to "index.ts" are less informative than ones pointing to the actual component file.

