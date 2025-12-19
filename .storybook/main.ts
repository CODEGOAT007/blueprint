import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
    stories: ["../packages/{core,datetime,labs,select,table}/src/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-docs"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            resolve: {
                dedupe: ["react", "react-dom"],
            },
            optimizeDeps: {
                // Force Vite to pre-bundle icons to avoid circular dependency with global Array
                include: ["@blueprintjs/icons"],
            },
        });
    },
};

export default config;
