/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { assert } from "chai";
import { spy } from "sinon";

import { Button, Classes, Drawer, Position } from "../../src";
import { hasClass } from "../utils";

describe("<Drawer>", () => {
    it("renders its content correctly", () => {
        const { container, baseElement } = render(
            <Drawer isOpen={true} usePortal={false}>
                {createDrawerContents()}
            </Drawer>,
        );
        [Classes.DRAWER, Classes.DRAWER_BODY, Classes.DRAWER_FOOTER].forEach(className => {
            const element = container.querySelector(`.${className}`);
            assert.isNotNull(element, `missing ${className}`);
        });
        // Backdrop renders to baseElement (document.body)
        const backdrop = baseElement.querySelector(`.${Classes.OVERLAY_BACKDROP}`);
        assert.isNotNull(backdrop, `missing ${Classes.OVERLAY_BACKDROP}`);
    });

    describe("position", () => {
        describe("RIGHT", () => {
            it("position right, size becomes width", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.RIGHT} size={100}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const drawer = container.querySelector<HTMLElement>(`.${Classes.DRAWER}`);
                assert.isNotNull(drawer);
                assert.equal(drawer!.style.width, "100px");
            });

            it("position right, adds appropriate classes (default behavior)", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.RIGHT}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const element = container.querySelector(`.${Classes.POSITION_RIGHT}`);
                assert.isNotNull(element);
            });
        });

        describe("TOP", () => {
            it("position top, size becomes height", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.TOP} size={100}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const drawer = container.querySelector<HTMLElement>(`.${Classes.DRAWER}`);
                assert.isNotNull(drawer);
                assert.equal(drawer!.style.height, "100px");
            });

            it("position top, adds appropriate classes (vertical, reverse)", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.TOP}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const element = container.querySelector(`.${Classes.POSITION_TOP}`);
                assert.isNotNull(element);
            });
        });

        describe("BOTTOM", () => {
            it("position bottom, size becomes height", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.BOTTOM} size={100}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const drawer = container.querySelector<HTMLElement>(`.${Classes.DRAWER}`);
                assert.isNotNull(drawer);
                assert.equal(drawer!.style.height, "100px");
            });

            it("position bottom, adds appropriate classes (vertical)", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.BOTTOM}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const element = container.querySelector(`.${Classes.POSITION_BOTTOM}`);
                assert.isNotNull(element);
            });
        });

        describe("LEFT", () => {
            it("position left, size becomes width", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.LEFT} size={100}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const drawer = container.querySelector<HTMLElement>(`.${Classes.DRAWER}`);
                assert.isNotNull(drawer);
                assert.equal(drawer!.style.width, "100px");
            });

            it("position left, adds appropriate classes (reverse)", () => {
                const { container } = render(
                    <Drawer isOpen={true} usePortal={false} position={Position.LEFT}>
                        {createDrawerContents()}
                    </Drawer>,
                );
                const element = container.querySelector(`.${Classes.POSITION_LEFT}`);
                assert.isNotNull(element);
            });
        });
    });

    it("size becomes width", () => {
        const { container } = render(
            <Drawer isOpen={true} usePortal={false} size={100}>
                {createDrawerContents()}
            </Drawer>,
        );
        const drawer = container.querySelector<HTMLElement>(`.${Classes.DRAWER}`);
        assert.isNotNull(drawer);
        assert.equal(drawer!.style.width, "100px");
    });

    it("portalClassName appears on Portal", () => {
        const TEST_CLASS = "test-class";
        render(
            <Drawer isOpen={true} portalClassName={TEST_CLASS}>
                {createDrawerContents()}
            </Drawer>,
        );
        const portal = document.querySelector(`.${Classes.PORTAL}.${TEST_CLASS}`);
        assert.isDefined(portal);
    });

    it("renders contents to specified container correctly", async () => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const { unmount } = render(
            <Drawer isOpen={true} portalContainer={container}>
                {createDrawerContents()}
            </Drawer>,
        );
        unmount();
        document.body.removeChild(container);

        const onClose = spy();
        const { baseElement } = render(
            <Drawer isOpen={true} onClose={onClose} usePortal={false}>
                {createDrawerContents()}
            </Drawer>,
        );
        const backdrop = baseElement.querySelector<HTMLElement>(`.${Classes.OVERLAY_BACKDROP}`);
        assert.isNotNull(backdrop);
        await userEvent.click(backdrop!);
        assert.isTrue(onClose.calledOnce);
    });

    it("doesn't close when canOutsideClickClose=false and overlay backdrop element is moused down", async () => {
        const onClose = spy();
        const { baseElement } = render(
            <Drawer canOutsideClickClose={false} isOpen={true} onClose={onClose} usePortal={false}>
                {createDrawerContents()}
            </Drawer>,
        );
        const backdrop = baseElement.querySelector<HTMLElement>(`.${Classes.OVERLAY_BACKDROP}`);
        assert.isNotNull(backdrop);
        await userEvent.click(backdrop!);
        assert.isTrue(onClose.notCalled);
    });

    it("doesn't close when canEscapeKeyClose=false and escape key is pressed", async () => {
        const onClose = spy();
        render(
            <Drawer canEscapeKeyClose={false} isOpen={true} onClose={onClose} usePortal={false}>
                {createDrawerContents()}
            </Drawer>,
        );
        await userEvent.keyboard("{Escape}");
        assert.isTrue(onClose.notCalled);
    });

    it("supports overlay lifecycle props", () => {
        const onOpening = spy();
        render(
            <Drawer isOpen={true} onOpening={onOpening}>
                body
            </Drawer>,
        );
        assert.isTrue(onOpening.calledOnce);
    });

    describe("header", () => {
        it(`does not render .${Classes.DRAWER_HEADER} if title omitted`, () => {
            const { container } = render(
                <Drawer isOpen={true} usePortal={false}>
                    drawer body
                </Drawer>,
            );
            const header = container.querySelector(`.${Classes.DRAWER_HEADER}`);
            assert.isNull(header);
        });

        it(`renders .${Classes.DRAWER_HEADER} if title prop is given`, () => {
            render(
                <Drawer isOpen={true} title="Hello!" usePortal={false}>
                    drawer body
                </Drawer>,
            );
            const heading = screen.getByText("Hello!");
            const header = heading.parentElement!;
            assert.isTrue(hasClass(header, Classes.DRAWER_HEADER));
        });

        it("clicking close button triggers onClose", async () => {
            const onClose = spy();
            render(
                <Drawer isOpen={true} title="Hello!" onClose={onClose} usePortal={false}>
                    drawer body
                </Drawer>,
            );
            const closeButton = screen.getByRole("button", { name: "Close" });
            await userEvent.click(closeButton);
            assert.isTrue(onClose.calledOnce);
        });

        it("does not render close button if isCloseButtonShown={false}", () => {
            render(
                <Drawer isCloseButtonShown={false} isOpen={true} title="Hello!" usePortal={false}>
                    drawer body
                </Drawer>,
            );
            assert.isNull(screen.queryByRole("button", { name: "Close" }));
        });
    });

    it("only adds its className in one location", () => {
        const { container } = render(<Drawer className="foo" isOpen={true} title="title" usePortal={false} />);
        const elements = container.querySelectorAll(".foo");
        assert.lengthOf(elements, 1);
    });

    // everything else about Drawer is tested by Overlay

    function createDrawerContents(): React.JSX.Element[] {
        return [
            <div className={Classes.DRAWER_BODY} key={1}>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna alqua. Ut enim ad minimum veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                </p>
            </div>,
            <div className={Classes.DRAWER_FOOTER} key={2}>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <Button text="Secondary" />
                    <Button className={Classes.INTENT_PRIMARY} type="submit" text="Primary" />
                </div>
            </div>,
        ];
    }
});
