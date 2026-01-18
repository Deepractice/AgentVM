import type { Meta, StoryObj } from "@storybook/react";
import TenantsPage from "@desktop/pages/Tenants";

const meta = {
  title: "Desktop/Pages/Tenants",
  component: TenantsPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TenantsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: "Tenants page in loading state (requires mock API)",
      },
    },
  },
};
