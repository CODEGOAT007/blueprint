#!/usr/bin/env node
/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
 *
 * Script to migrate core package tests from test/ to colocated with components.
 *
 * Usage: node scripts/colocate-core-tests.mjs
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const CORE_PKG = "packages/core";
const TEST_DIR = path.join(CORE_PKG, "test");
const SRC_COMPONENTS_DIR = path.join(CORE_PKG, "src/components");

// Directory mappings where test directory name differs from component directory
const DIR_MAPPINGS = {
    "buttons": "button",
    "progress": "progress-bar",
    "multistep-dialog": "dialog",
    "controls": "forms",
};

// Test files to migrate with their source and target paths
// Format: [sourceTestDir, testFileName, targetComponentDir, targetFileName]
const TEST_MIGRATIONS = [
    // Simple 1:1 mappings
    ["alert", "alertTests.tsx", "alert", "alert.test.tsx"],
    ["breadcrumbs", "breadcrumbTests.tsx", "breadcrumbs", "breadcrumb.test.tsx"],
    ["breadcrumbs", "breadcrumbsTests.tsx", "breadcrumbs", "breadcrumbs.test.tsx"],
    ["callout", "calloutTests.tsx", "callout", "callout.test.tsx"],
    ["card", "cardTests.tsx", "card", "card.test.tsx"],
    ["card-list", "cardListTests.tsx", "card-list", "cardList.test.tsx"],
    ["collapse", "collapseTests.tsx", "collapse", "collapse.test.tsx"],
    ["context-menu", "contextMenuTests.tsx", "context-menu", "contextMenu.test.tsx"],
    ["context-menu", "contextMenuSingletonTests.tsx", "context-menu", "contextMenuSingleton.test.tsx"],
    ["control-card", "controlCardTests.tsx", "control-card", "controlCard.test.tsx"],
    ["dialog", "dialogTests.tsx", "dialog", "dialog.test.tsx"],
    ["drawer", "drawerTests.tsx", "drawer", "drawer.test.tsx"],
    ["editable-text", "editableTextTests.tsx", "editable-text", "editableText.test.tsx"],
    ["entity-title", "entityTitleTests.tsx", "entity-title", "entityTitle.test.tsx"],
    ["hotkeys", "hotkeyTests.tsx", "hotkeys", "hotkey.test.tsx"],
    ["hotkeys", "hotkeysParserTests.ts", "hotkeys", "hotkeysParser.test.ts"],
    ["hotkeys", "keyComboTagTests.tsx", "hotkeys", "keyComboTag.test.tsx"],
    ["html", "htmlTests.tsx", "html", "html.test.tsx"],
    ["html-select", "htmlSelectTests.tsx", "html-select", "htmlSelect.test.tsx"],
    ["icon", "iconTests.tsx", "icon", "icon.test.tsx"],
    ["menu", "menuTests.tsx", "menu", "menu.test.tsx"],
    ["menu", "menuItemTests.tsx", "menu", "menuItem.test.tsx"],
    ["non-ideal-state", "nonIdealStateTests.tsx", "non-ideal-state", "nonIdealState.test.tsx"],
    ["overflow-list", "overflowListTests.tsx", "overflow-list", "overflowList.test.tsx"],
    ["overlay", "overlayTests.tsx", "overlay", "overlay.test.tsx"],
    ["overlay2", "overlay2Tests.tsx", "overlay2", "overlay2.test.tsx"],
    ["panel-stack", "panelStackTests.tsx", "panel-stack", "panelStack.test.tsx"],
    ["popover", "popoverTests.tsx", "popover", "popover.test.tsx"],
    ["popover", "popperUtilTests.ts", "popover", "popperUtils.test.ts"],
    ["portal", "portalTests.tsx", "portal", "portal.test.tsx"],
    ["resize-sensor", "resizeSensorTests.tsx", "resize-sensor", "resizeSensor.test.tsx"],
    ["section", "sectionTests.tsx", "section", "section.test.tsx"],
    ["segmented-control", "segmentedControlTests.tsx", "segmented-control", "segmentedControl.test.tsx"],
    ["slider", "sliderTests.tsx", "slider", "slider.test.tsx"],
    ["slider", "multiSliderTests.tsx", "slider", "multiSlider.test.tsx"],
    ["slider", "rangeSliderTests.tsx", "slider", "rangeSlider.test.tsx"],
    ["slider", "handleTests.tsx", "slider", "handle.test.tsx"],
    ["spinner", "spinnerTests.tsx", "spinner", "spinner.test.tsx"],
    ["tabs", "tabsTests.tsx", "tabs", "tabs.test.tsx"],
    ["tag", "tagTests.tsx", "tag", "tag.test.tsx"],
    ["tag", "compoundTagTests.tsx", "tag", "compoundTag.test.tsx"],
    ["tag-input", "tagInputTests.tsx", "tag-input", "tagInput.test.tsx"],
    ["text", "textTests.tsx", "text", "text.test.tsx"],
    ["toast", "toastTests.tsx", "toast", "toast.test.tsx"],
    ["toast", "overlayToasterTests.tsx", "toast", "overlayToaster.test.tsx"],
    ["tooltip", "tooltipTests.tsx", "tooltip", "tooltip.test.tsx"],
    ["tree", "treeTests.tsx", "tree", "tree.test.tsx"],

    // Mappings with different directory names
    ["buttons", "buttonTests.tsx", "button", "button.test.tsx"],
    ["progress", "progressBarTests.tsx", "progress-bar", "progressBar.test.tsx"],
    ["multistep-dialog", "multistepDialogTests.tsx", "dialog", "multistepDialog.test.tsx"],
    ["controls", "controlsTests.tsx", "forms", "controls.test.tsx"],
    ["controls", "inputGroupTests.tsx", "forms", "inputGroup.test.tsx"],
    ["controls", "numericInputTests.tsx", "forms", "numericInput.test.tsx"],
    ["controls", "radioGroupTests.tsx", "forms", "radioGroup.test.tsx"],
    ["forms", "asyncControllableInputTests.tsx", "forms", "asyncControllableInput.test.tsx"],
    ["forms", "fileInputTests.tsx", "forms", "fileInput.test.tsx"],
    ["forms", "formGroupTests.tsx", "forms", "formGroup.test.tsx"],
    ["forms", "textAreaTests.tsx", "forms", "textArea.test.tsx"],
];

/**
 * Update import paths in a test file when moving from test/ to src/components/
 */
function updateImportPaths(content, sourceTestDir, targetComponentDir) {
    let updated = content;

    // Pattern: import from "../../src" -> import from "../../"
    // The test file moves from test/component/ to src/components/component/
    // So ../../src becomes ../../ (which points to src/)
    updated = updated.replace(
        /from\s+["']\.\.\/\.\.\/src["']/g,
        'from "../../"'
    );

    // Pattern: import from "../../src/components/X/Y" -> import from "../X/Y"
    // When in src/components/component/, other components are at ../
    updated = updated.replace(
        /from\s+["']\.\.\/\.\.\/src\/components\/([^"']+)["']/g,
        'from "../$1"'
    );

    // Pattern: import from "../../src/common" -> import from "../../common"
    updated = updated.replace(
        /from\s+["']\.\.\/\.\.\/src\/common(\/[^"']*)?["']/g,
        'from "../../common$1"'
    );

    // Pattern: import from "../utils" -> import from "../../../test/utils"
    // The test/utils.tsx file stays in place, so we need to go up 3 levels
    updated = updated.replace(
        /from\s+["']\.\.\/utils["']/g,
        'from "../../../test/utils"'
    );

    // Pattern: import from "./sliderTestUtils" -> import from "../../../test/sliderTestUtils"
    // For slider tests that import local test utils
    if (sourceTestDir === "slider") {
        updated = updated.replace(
            /from\s+["']\.\/sliderTestUtils["']/g,
            'from "../../../test/sliderTestUtils"'
        );
    }

    return updated;
}

/**
 * Migrate a single test file
 */
function migrateTestFile(sourceTestDir, testFileName, targetComponentDir, targetFileName) {
    const sourcePath = path.join(TEST_DIR, sourceTestDir, testFileName);
    const targetPath = path.join(SRC_COMPONENTS_DIR, targetComponentDir, targetFileName);

    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
        console.error(`  ❌ Source not found: ${sourcePath}`);
        return false;
    }

    // Check if target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        console.error(`  ❌ Target directory not found: ${targetDir}`);
        return false;
    }

    // Read source file
    let content = fs.readFileSync(sourcePath, "utf-8");

    // Update import paths
    content = updateImportPaths(content, sourceTestDir, targetComponentDir);

    // Write to target location
    fs.writeFileSync(targetPath, content);

    // Remove source file
    fs.unlinkSync(sourcePath);

    console.log(`  ✓ ${sourceTestDir}/${testFileName} -> ${targetComponentDir}/${targetFileName}`);
    return true;
}

/**
 * Remove empty directories
 */
function removeEmptyDirs(dirs) {
    for (const dir of dirs) {
        const fullPath = path.join(TEST_DIR, dir);
        if (fs.existsSync(fullPath)) {
            const contents = fs.readdirSync(fullPath);
            if (contents.length === 0) {
                fs.rmdirSync(fullPath);
                console.log(`  ✓ Removed empty directory: test/${dir}`);
            } else {
                console.log(`  ⚠ Directory not empty: test/${dir} (${contents.join(", ")})`);
            }
        }
    }
}

/**
 * Main migration function
 */
function main() {
    console.log("🚀 Starting core test migration...\n");

    // Track which test directories we're migrating from
    const testDirs = new Set();

    // Migrate all test files
    console.log("📦 Migrating test files:\n");
    let successCount = 0;
    let failCount = 0;

    for (const [sourceTestDir, testFileName, targetComponentDir, targetFileName] of TEST_MIGRATIONS) {
        testDirs.add(sourceTestDir);
        if (migrateTestFile(sourceTestDir, testFileName, targetComponentDir, targetFileName)) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log(`\n📊 Migration complete: ${successCount} succeeded, ${failCount} failed\n`);

    // Move sliderTestUtils.ts to test/ root
    console.log("📦 Moving shared test utilities:\n");
    const sliderUtilsSource = path.join(TEST_DIR, "slider", "sliderTestUtils.ts");
    const sliderUtilsTarget = path.join(TEST_DIR, "sliderTestUtils.ts");
    if (fs.existsSync(sliderUtilsSource)) {
        fs.renameSync(sliderUtilsSource, sliderUtilsTarget);
        console.log("  ✓ slider/sliderTestUtils.ts -> sliderTestUtils.ts\n");
    }

    // Clean up empty directories
    console.log("🧹 Cleaning up empty directories:\n");
    removeEmptyDirs([...testDirs]);

    console.log("\n✅ Done! Next steps:");
    console.log("   1. Update packages/core/vitest.config.mts to include src/**/*.test.{ts,tsx}");
    console.log("   2. Update packages/core/test/index.ts to remove component imports");
    console.log("   3. Run tests: pnpm nx test:vitest:run @blueprintjs/core");
}

main();
