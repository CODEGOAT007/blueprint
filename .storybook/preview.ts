import type { Preview } from "@storybook/react-vite";

// Import Blueprint compiled CSS
import "../packages/core/lib/css/blueprint.css";
import "../packages/datetime/lib/css/blueprint-datetime.css";
// Note: Icons CSS is not imported globally to avoid dependency optimization issues.
// Individual stories can import: import "@blueprintjs/icons/lib/css/blueprint-icons.css";
// if they need icon styling.

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            default: "light",
            values: [
                {
                    name: "light",
                    value: "#ffffff",
                },
                {
                    name: "dark",
                    value: "#30404d",
                },
            ],
        },
    },
};

export default preview;
