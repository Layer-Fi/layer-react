# Styling Best Practices

- Avoid adding unnecessary css classes. Try to use props instead of adding new css classes when possible.
- Make new .scss files in the component folder instead of adding to the global .scss file when necessary to add css.
- Don't use lowercase `<span>`. Instead, use `Span` from `../ui/Typography/Text`.
- Use `<HStack>` and `<VStack>` from `../ui/Stack/Stack` instead of defining a div with css classes.
- Try to build on top of our existing components in `../ui` instead of creating new ones.