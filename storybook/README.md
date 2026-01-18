# AgentVM Storybook

Unified component documentation for all AgentVM UI platforms (Desktop, Web, etc.).

## Structure

```
storybook/
├── stories/
│   ├── desktop/          # Desktop app components
│   │   ├── Layout.stories.tsx
│   │   ├── Tenants.stories.tsx
│   │   └── ...
│   └── web/              # Future: Web app components
│       └── ...
├── .storybook/
│   ├── main.ts           # Storybook config
│   ├── preview.ts        # Global decorators/parameters
│   └── vite.config.ts    # Vite config for path aliases
└── package.json
```

## Commands

```bash
# Start Storybook dev server
cd storybook
bun run storybook

# Build static docs
bun run build

# Preview built docs
bun run preview
```

## Writing Stories

### Import components from desktop

```tsx
import MyComponent from "@desktop/components/MyComponent";
```

The `@desktop` alias maps to `../apps/desktop/src`.

### Example story

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ChatList } from "@desktop/components/business/ChatList";

const meta = {
  title: "Desktop/Business/ChatList",
  component: ChatList,
} satisfies Meta<typeof ChatList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    chats: [],
  },
};

export const WithChats: Story = {
  args: {
    chats: [{ id: "1", title: "Sales Agent", lastMessage: "Hello" }],
  },
};
```

## Accessing Storybook

Once started, open `http://localhost:6006` in your browser.

## Why separate directory?

- **Cross-platform**: Document Desktop and Web components in one place
- **Build isolation**: Storybook doesn't bloat app bundles
- **Centralized docs**: Single source of truth for all UI components
