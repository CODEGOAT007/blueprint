/* !
 * (c) Copyright 2026 Palantir Technologies Inc. All rights reserved.
 */

import type { Preview } from "@storybook/react-vite";

import { FocusStyleManager } from "../packages/core/src";
import { Icons } from "../packages/icons/src/iconLoader";

FocusStyleManager.onlyShowFocusOnTabs();

Icons.setLoaderOptions({ loader: "all" });

// optionally, load the icons up-front so that future usage does not trigger a network request
await Icons.loadAll();

// Import Blueprint compiled CSS
import "../packages/core/lib/css/blueprint.css";
import "../packages/datetime/lib/css/blueprint-datetime.css";

// Note: Icons CSS is not imported globally to avoid dependency optimization issues.
// Individual stories can import: import "@blueprintjs/icons/lib/css/blueprint-icons.css";
// if they need icon styling.

const preview: Preview = {
    parameters: {
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
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
