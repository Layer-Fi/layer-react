# Styling Best Practices

- Avoid adding unnecessary css classes and to use existing props when possible.
- Do not use in-line styling aside from existing props.
- When creating css, make a .scss file with the same name as the .ts or .tsx file and directly import the .scss file. Do not use any index.ts files.
- Don't use lowercase `<span>`. Instead, use `Span` from `../ui/Typography/Text`.
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of defining a div with css classes.
- Try to build on top of our existing components in `../ui` instead of creating new ones.