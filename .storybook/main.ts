/* !
 * (c) Copyright 2026 Palantir Technologies Inc. All rights reserved.
 */

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const storybookConfig: StorybookConfig = {
    addons: ["@storybook/addon-links", "@storybook/addon-docs"],
    core: {
        disableTelemetry: true,
    },
    stories: ["../packages/{core,datetime,labs,select,table}/src/**/*.stories.@(ts|tsx)"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            optimizeDeps: {
                // Force Vite to pre-bundle icons to avoid circular dependency with global Array
                include: ["@blueprintjs/icons"],
            },
            resolve: {
                dedupe: ["react", "react-dom"],
            },
        });
    },
};

export default storybookConfig;
