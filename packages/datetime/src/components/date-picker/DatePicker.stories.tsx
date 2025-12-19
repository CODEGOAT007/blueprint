/* !
 * (c) Copyright 2025 Palantir Technologies Inc. All rights reserved.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";

import { DatePicker } from "./datePicker";

const meta = {
    title: "Datetime/DatePicker",
    component: DatePicker,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A basic DatePicker component showing the calendar interface.
 * Click on a date to select it.
 */
export const Basic: Story = {
    args: {
        onChange: date => {
            console.log("Selected date:", date);
        },
    },
};
