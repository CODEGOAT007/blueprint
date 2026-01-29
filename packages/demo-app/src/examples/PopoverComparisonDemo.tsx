/*
 * Copyright 2026 Palantir Technologies Inc. All rights reserved.
 */

import { useCallback, useState } from "react";

import {
    Button,
    Card,
    Classes,
    Drawer,
    FormGroup,
    H4,
    H5,
    HTMLSelect,
    Popover,
    PopoverInteractionKind,
    PopoverNext,
    Position,
    Switch,
} from "@blueprintjs/core";

/** Event handler that exposes the target element's value as a boolean. */
function handleBooleanChange(handler: (value: boolean) => void) {
    return (event: React.FormEvent<HTMLInputElement>) => handler(event.currentTarget.checked);
}

/** Event handler that exposes the target element's value. */
function handleValueChange<T>(handler: (value: T) => void) {
    return (event: React.ChangeEvent<HTMLSelectElement>) => handler(event.target.value as unknown as T);
}

type Placement =
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";

const PLACEMENTS: Array<Placement | "auto"> = [
    "auto",
    "top",
    "top-start",
    "top-end",
    "bottom",
    "bottom-start",
    "bottom-end",
    "left",
    "left-start",
    "left-end",
    "right",
    "right-start",
    "right-end",
];

const INTERACTION_KINDS = [
    { label: "Click", value: PopoverInteractionKind.CLICK },
    { label: "Click (target only)", value: PopoverInteractionKind.CLICK_TARGET_ONLY },
    { label: "Hover", value: PopoverInteractionKind.HOVER },
    { label: "Hover (target only)", value: PopoverInteractionKind.HOVER_TARGET_ONLY },
];

export function PopoverComparisonDemo() {
    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Appearance
    const [placement, setPlacement] = useState<Placement | "auto">("auto");
    const [arrow, setArrow] = useState(true);
    const [matchTargetWidth, setMatchTargetWidth] = useState(false);
    const [usePortal, setUsePortal] = useState(true);
    const [swapPositions, setSwapPositions] = useState(false);
    const [showOnlyLegacy, setShowOnlyLegacy] = useState(false);
    const [showOnlyNew, setShowOnlyNew] = useState(false);

    // Interactions
    const [interactionKind, setInteractionKind] = useState<PopoverInteractionKind>(PopoverInteractionKind.CLICK);
    const [hasBackdrop, setHasBackdrop] = useState(false);
    const [disabled, setDisabled] = useState(false);

    // Control
    const [isControlled, setIsControlled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const isClickInteraction =
        interactionKind === PopoverInteractionKind.CLICK ||
        interactionKind === PopoverInteractionKind.CLICK_TARGET_ONLY;

    const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

    const handleShowOnlyLegacyChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        setShowOnlyLegacy(checked);
        if (checked) {
            setShowOnlyNew(false);
        }
    }, []);

    const handleShowOnlyNewChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        const checked = event.currentTarget.checked;
        setShowOnlyNew(checked);
        if (checked) {
            setShowOnlyLegacy(false);
        }
    }, []);

    const showLegacy = !showOnlyNew;
    const showNew = !showOnlyLegacy;

    const popoverContent = (
        <div key="text">
            <H5>Confirm deletion</H5>
            <p>Are you sure you want to delete these items? You won't be able to recover them.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                    Cancel
                </Button>
                <Button className={Classes.POPOVER_DISMISS} intent="danger">
                    Delete
                </Button>
            </div>
        </div>
    );

    // Resolve placement for components (undefined means auto for PopoverNext)
    const resolvedPlacement = placement === "auto" ? undefined : placement;

    return (
        <div style={{ height: "100vh", position: "relative", width: "100%" }}>
            {/* Settings button */}
            <Button
                icon="cog"
                intent="primary"
                onClick={handleOpenDrawer}
                style={{ left: 20, position: "absolute", top: 20, zIndex: 10 }}
            >
                Settings
            </Button>

            {/* Settings drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                position={Position.LEFT}
                size={240}
                title="Popover Settings"
                autoFocus={false}
                enforceFocus={false}
                hasBackdrop={false}
            >
                <div className={Classes.DRAWER_BODY}>
                    <div className={Classes.DIALOG_BODY}>
                        <H5>Appearance</H5>
                        <FormGroup label="Placement">
                            <HTMLSelect
                                fill={true}
                                value={placement}
                                onChange={handleValueChange(setPlacement)}
                                options={PLACEMENTS}
                            />
                        </FormGroup>
                        <Switch label="Show arrow" checked={arrow} onChange={handleBooleanChange(setArrow)} />
                        <Switch
                            label="Match target width"
                            checked={matchTargetWidth}
                            onChange={handleBooleanChange(setMatchTargetWidth)}
                        />
                        <Switch label="Use portal" checked={usePortal} onChange={handleBooleanChange(setUsePortal)} />

                        <H5>Control</H5>
                        <Switch
                            label="Is controlled"
                            checked={isControlled}
                            onChange={handleBooleanChange(setIsControlled)}
                        />
                        <Switch
                            label="Open"
                            checked={isOpen}
                            disabled={!isControlled}
                            onChange={handleBooleanChange(setIsOpen)}
                        />

                        <H5>Interactions</H5>
                        <FormGroup label="Interaction kind">
                            <HTMLSelect
                                fill={true}
                                value={interactionKind}
                                onChange={handleValueChange(setInteractionKind)}
                                options={INTERACTION_KINDS}
                            />
                        </FormGroup>
                        <Switch label="Disabled" checked={disabled} onChange={handleBooleanChange(setDisabled)} />
                        <Switch
                            label="Has backdrop"
                            checked={hasBackdrop}
                            disabled={!isClickInteraction}
                            onChange={handleBooleanChange(setHasBackdrop)}
                        />

                        <H5>Display</H5>
                        <Switch
                            label="Swap positions"
                            checked={swapPositions}
                            onChange={handleBooleanChange(setSwapPositions)}
                        />
                        <Switch
                            label="Only show legacy"
                            checked={showOnlyLegacy}
                            onChange={handleShowOnlyLegacyChange}
                        />
                        <Switch label="Only show new" checked={showOnlyNew} onChange={handleShowOnlyNewChange} />
                    </div>
                </div>
            </Drawer>

            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: swapPositions ? "row-reverse" : "row",
                    height: "100%",
                    justifyContent: "space-evenly",
                    padding: 40,
                }}
            >
                {showLegacy && (
                    <Card style={{ padding: 30, textAlign: "center" }} elevation={2}>
                        <H4>Popover (Legacy)</H4>
                        <p className={Classes.TEXT_MUTED}>Built on Popper.js</p>
                        <Popover
                            content={popoverContent}
                            placement={resolvedPlacement}
                            interactionKind={interactionKind}
                            disabled={disabled}
                            usePortal={usePortal}
                            hasBackdrop={isClickInteraction && hasBackdrop}
                            minimal={!arrow}
                            matchTargetWidth={matchTargetWidth}
                            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                            isOpen={isControlled ? isOpen : undefined}
                            autoFocus={false}
                            enforceFocus={false}
                        >
                            <Button intent="primary" size="large" text="Open Popover" />
                        </Popover>
                    </Card>
                )}
                {showNew && (
                    <Card style={{ padding: 30, textAlign: "center" }} elevation={2}>
                        <H4>PopoverNext (New)</H4>
                        <p className={Classes.TEXT_MUTED}>Built on Floating UI</p>
                        <PopoverNext
                            content={popoverContent}
                            placement={resolvedPlacement}
                            interactionKind={interactionKind}
                            disabled={disabled}
                            usePortal={usePortal}
                            hasBackdrop={isClickInteraction && hasBackdrop}
                            arrow={arrow}
                            matchTargetWidth={matchTargetWidth}
                            popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                            isOpen={isControlled ? isOpen : undefined}
                            autoFocus={false}
                            enforceFocus={false}
                        >
                            <Button intent="primary" size="large" text="Open Popover" />
                        </PopoverNext>
                    </Card>
                )}
            </div>
        </div>
    );
}

PopoverComparisonDemo.displayName = "DemoApp.PopoverComparisonDemo";
