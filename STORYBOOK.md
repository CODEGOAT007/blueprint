# Storybook Setup for Blueprint.js

## Overview

This project has a centralized Storybook v10.1.10 instance for developing and showcasing components from multiple Blueprint packages in one unified interface.

## Running Storybook

```bash
# First, ensure CSS is compiled (one-time or when styles change)
pnpm compile

# Start development server
pnpm storybook

# Build static version
pnpm build-storybook
```

Storybook will be available at: **http://localhost:6006/**

## Architecture

- **Single Instance**: One Storybook instance serves all packages (core, datetime, labs, select, table)
- **Co-located Stories**: Story files live alongside components in their respective packages
- **Vite Builder**: Uses `@storybook/react-vite` for fast builds and hot module replacement
- **TypeScript**: Full type safety with proper imports from `@storybook/react-vite`
- **Minimal Configuration**: Simple Vite setup with React deduplication and icons pre-bundling

## Current Stories

### Core Package

- **Button** stories at `packages/core/src/components/button/Button.stories.tsx`
    - Default button example
    - Solid intent variants (Primary, Success, Warning, Danger)

### Datetime Package

- **DatePicker** story at `packages/datetime/src/components/date-picker/DatePicker.stories.tsx`
    - Basic DatePicker example

## Adding New Stories

To add stories for other components:

1. Create a `*.stories.tsx` file next to your component
2. Import types from `@storybook/react-vite`
3. Follow the existing story patterns

Example:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { YourComponent } from "./yourComponent";

const meta = {
    title: "PackageName/ComponentName",
    component: YourComponent,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
    args: {
        // your props here
    },
};
```

## Configuration Files

- `.storybook/main.ts` - Main Storybook configuration
    - Stories glob pattern for all packages
    - Vite configuration with React deduplication
    - `@blueprintjs/icons` pre-bundling in `optimizeDeps`
- `.storybook/preview.ts` - Preview configuration
    - Imports compiled Blueprint CSS
    - Sets up default backgrounds and controls
- `.storybook/tsconfig.json` - TypeScript configuration for Storybook environment

## Dependencies

Storybook packages installed at root:

- `storybook@^10.1.10` - Main Storybook CLI and core
- `@storybook/react@^10.1.10` - React framework support
- `@storybook/react-vite@^10.1.10` - Vite builder for React
- `@storybook/react-dom-shim@^10.1.10` - React DOM compatibility layer
- `@storybook/addon-links@^10.1.10` - Addon for linking between stories
- `@storybook/addon-docs@^10.1.10` - Addon for documentation
- `@storybook/icons@^1.6.0` - Icon library for Storybook UI
- `@babel/runtime@^7.28.4` - Babel runtime helpers
- `vite@^7.1.12` - Build tool and dev server

## Notes

- **CSS Compilation**: Storybook uses compiled CSS from `packages/*/lib/css/` directories. Run `pnpm compile` to generate these before starting Storybook.
- **Story Exclusion**: Story files (`*.stories.tsx`) are excluded from package TypeScript compilation via `exclude` patterns in package tsconfig.json files.
- **Workspace Resolution**: Blueprint packages are resolved via pnpm workspace protocol

## Troubleshooting

### No styles showing

Run `pnpm compile` to generate CSS files in `packages/*/lib/css/`

### Stories not loading

Check that your story files match the glob pattern in `.storybook/main.ts`:

```typescript
stories: ["../packages/{core,datetime,labs,select,table}/src/**/*.stories.@(ts|tsx)"];
```

### Vite cache issues

Clear Vite's dependency cache:

```bash
rm -rf node_modules/.vite
pnpm storybook
```
