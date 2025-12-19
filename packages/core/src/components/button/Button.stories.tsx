/* !
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Intent } from "../../common/intent";
import { Button } from "./buttons";

const meta = {
    title: "Core/Button",
    component: Button,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A basic button with default styling.
 */
export const Default: Story = {
    args: {
        text: "Click me",
    },
};

/**
 * Buttons with different intent colors using the solid variant.
 * Intents provide semantic meaning through color coding.
 */
export const SolidIntents: Story = {
    render: () => (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button text="Default" intent={Intent.NONE} />
            <Button text="Primary" intent={Intent.PRIMARY} />
            <Button text="Success" intent={Intent.SUCCESS} />
            <Button text="Warning" intent={Intent.WARNING} />
            <Button text="Danger" intent={Intent.DANGER} />
        </div>
    ),
};
