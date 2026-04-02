# Create Quick React

`create-quick-react` scaffolds a Vite React app with a faster setup flow for modern frontend projects.

It can generate JavaScript or TypeScript apps with optional routing, state management, API clients, testing, linting, env files, Tailwind, and `shadcn/ui`.

## Features

- Vite React starter in JavaScript or TypeScript
- Tailwind CSS setup
- Optional `shadcn/ui` setup with starter components
- Optional React Router starter using modern data-router patterns
- State management choices: `None`, `Redux`, `Context API`, or `Both`
- Auth starter choices: `None`, `Demo Protected Route`, or `JWT Starter`
- API client choices: `None`, `Fetch Client`, or `Axios Client`
- Testing choices: `None`, `Vitest`, `Vitest + React Testing Library`, or `Playwright`
- Linting choices: `None`, `Prettier`, or `ESLint + Prettier`
- Environment file starter
- Project structure presets
- Starter page presets
- Grouped optional package selection
- Quick mode with CLI flags and `--yes`

## Usage

Run it with `npx`:

```sh
npx create-quick-react
```

Or install it globally:

```sh
npm install -g create-quick-react
create-quick-react
```

You can also pass the project name directly:

```sh
create-quick-react my-app
```

## Quick Mode

Use `--yes` to scaffold with defaults:

```sh
create-quick-react my-app --yes
```

Example with flags:

```sh
create-quick-react my-app --lang ts --state both --ui shadcn --router react --auth jwt --api axios --yes
```

Supported flags:

- `--yes`, `-y`
- `--lang js|ts`
- `--state none|redux|context|both`
- `--ui tailwind|shadcn`
- `--router none|react`
- `--auth none|demo|jwt`
- `--api none|fetch|axios`

## Interactive Flow

The CLI can ask for:

- Project name
- JavaScript or TypeScript
- State management choice
- Tailwind or Tailwind + `shadcn/ui`
- Routing choice
- Auth starter
- API client starter
- Testing setup
- Linting setup
- Env file starter
- Project structure preset
- Starter page preset
- Optional package groups
- `shadcn/ui` starter components

## Generated Project

Depending on your choices, the generated app can include:

- `src/App.jsx` or `src/App.tsx`
- `src/main.jsx` or `src/main.tsx`
- `src/hooks/` for routing and auth helpers
- `src/contextApi/` for theme context
- `src/redux/` for Redux Toolkit starter files
- `src/lib/` for API client utilities
- `src/config/` for env helpers
- `src/index.css` with Tailwind enabled
- optional `shadcn/ui` components
- generated README content inside the new app

## Notes

- Context API is intended for lightweight UI-wide concerns like theme.
- Redux Toolkit is intended for structured shared app state using slices and selectors.
- React Router setup uses route objects, `createBrowserRouter`, `RouterProvider`, and protected route helpers when auth is enabled.
- The generated starter app includes a GitHub link back to this project:
  `https://github.com/umar792/create-quick-react`

## Local Development

```sh
npm install
npm run build
npm link
```

Then test locally with:

```sh
create-quick-react
```

## License

MIT
