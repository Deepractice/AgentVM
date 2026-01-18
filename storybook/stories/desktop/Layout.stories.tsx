import type { Meta, StoryObj } from "@storybook/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "@desktop/components/Layout";

const meta = {
  title: "Desktop/Layout/Layout",
  component: Layout,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ height: "100vh" }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
