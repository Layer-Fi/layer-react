# Storybook backend modes

The default Storybook command uses MSW-backed fixture data.

```sh
npm run storybook
```

To use a real Layer business, copy `.storybook/.env.example` to the repository root as `.env`, provide a temporary business access token, and run:

```sh
npm run storybook:real
```

Real-backend mode disables Storybook's global MSW initialization and loader. Do not publish a static Storybook containing real-backend credentials.
