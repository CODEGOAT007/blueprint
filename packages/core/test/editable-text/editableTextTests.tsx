/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
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

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { assert } from "chai";
import { spy } from "sinon";

import { Classes, EditableText } from "../../src";

describe("<EditableText>", () => {
    it("renders value", () => {
        render(<EditableText value="alphabet" />);
        assert.isNotNull(screen.queryByText("alphabet"));
    });

    it("renders defaultValue", () => {
        render(<EditableText defaultValue="default" />);
        assert.isNotNull(screen.queryByText("default"));
    });

    it("renders placeholder", () => {
        render(<EditableText placeholder="Edit..." />);
        assert.isNotNull(screen.queryByText("Edit..."));
    });

    it("cannot be edited when disabled", () => {
        const { container } = render(<EditableText disabled={true} isEditing={true} />);
        // When disabled + isEditing, the component should NOT be in editing state
        const input = container.querySelector("input");
        assert.isNull(input, "input should not be rendered when disabled");
    });

    it("allows resetting controlled value to undefined or null", () => {
        const { rerender } = render(<EditableText isEditing={false} placeholder="placeholder" value="alphabet" />);
        assert.isNotNull(screen.queryByText("alphabet"));
        rerender(<EditableText isEditing={false} placeholder="placeholder" value={undefined} />);
        assert.isNotNull(screen.queryByText("placeholder"));
    });

    it("passes an ID to the underlying span", () => {
        const { container } = render(<EditableText disabled={true} isEditing={true} contentId="my-id" />);
        const span = container.querySelector(`#my-id`);
        assert.isNotNull(span, "span with id should exist");
    });

    describe("when editing", () => {
        it('renders <input type="text"> when editing', () => {
            render(<EditableText isEditing={true} />);
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");
            assert.strictEqual(textbox.type, "text");
        });

        it("unrenders input when done editing", () => {
            const { rerender } = render(<EditableText isEditing={true} placeholder="Edit..." value="alphabet" />);
            assert.isNotNull(screen.queryByRole("textbox"));
            rerender(<EditableText isEditing={false} placeholder="Edit..." value="alphabet" />);
            assert.isNull(screen.queryByRole("textbox"));
        });

        it("calls onChange when input is changed", async () => {
            const changeSpy = spy();
            // Note: using controlled component (value prop), so fireEvent.change is needed
            // to directly set values since userEvent.clear() won't work on controlled inputs
            render(<EditableText isEditing={true} onChange={changeSpy} placeholder="Edit..." value="alphabet" />);
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            fireEvent.change(textbox, { target: { value: "hello" } });
            fireEvent.change(textbox, { target: { value: " " } });
            fireEvent.change(textbox, { target: { value: "world" } });
            assert.isTrue(changeSpy.calledThrice, "onChange not called thrice");
            assert.deepEqual(changeSpy.args, [["hello"], [" "], ["world"]]);
        });

        it("calls onChange when escape key pressed and value is unconfirmed", async () => {
            const changeSpy = spy();
            render(
                <EditableText isEditing={true} onChange={changeSpy} placeholder="Edit..." defaultValue="alphabet" />,
            );
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            await userEvent.clear(textbox);
            await userEvent.type(textbox, "hello");
            await userEvent.keyboard("{Escape}");

            // Last call should be the revert to original value
            assert.strictEqual(changeSpy.lastCall.args[0], "alphabet", "should revert to original value on escape");
        });

        it("calls onCancel, does not call onConfirm, and reverts value when escape key pressed", async () => {
            const cancelSpy = spy();
            const confirmSpy = spy();

            const OLD_VALUE = "alphabet";
            const NEW_VALUE = "hello";

            const { container } = render(
                <EditableText isEditing={true} onCancel={cancelSpy} onConfirm={confirmSpy} defaultValue={OLD_VALUE} />,
            );
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            await userEvent.clear(textbox);
            await userEvent.type(textbox, NEW_VALUE);
            await userEvent.keyboard("{Escape}");

            assert.isTrue(confirmSpy.notCalled, "onConfirm called");
            assert.isTrue(cancelSpy.calledOnce, "onCancel not called once");
            assert.isTrue(cancelSpy.calledWith(OLD_VALUE), `unexpected argument "${cancelSpy.args[0][0]}"`);
            // After escape, the component exits edit mode and displays the reverted value in the span
            const content = container.querySelector(`.${Classes.EDITABLE_TEXT_CONTENT}`);
            assert.isNotNull(content, "content span should exist");
            assert.strictEqual(content!.textContent, OLD_VALUE, "did not revert to original value");
        });

        it("calls onConfirm, does not call onCancel, and saves value when enter key pressed", async () => {
            const cancelSpy = spy();
            const confirmSpy = spy();

            const OLD_VALUE = "alphabet";
            const NEW_VALUE = "hello";

            render(
                <EditableText isEditing={true} onCancel={cancelSpy} onConfirm={confirmSpy} defaultValue={OLD_VALUE} />,
            );
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            await userEvent.clear(textbox);
            await userEvent.type(textbox, NEW_VALUE);
            await userEvent.keyboard("{Enter}");

            assert.isTrue(cancelSpy.notCalled, "onCancel called");
            assert.isTrue(confirmSpy.calledOnce, "onConfirm not called once");
            assert.isTrue(confirmSpy.calledWith(NEW_VALUE), `unexpected argument "${confirmSpy.args[0][0]}"`);
        });

        it("calls onConfirm when enter key pressed even if value didn't change", async () => {
            const cancelSpy = spy();
            const confirmSpy = spy();

            const OLD_VALUE = "alphabet";
            const NEW_VALUE = "hello";

            render(
                <EditableText isEditing={true} onCancel={cancelSpy} onConfirm={confirmSpy} defaultValue={OLD_VALUE} />,
            );
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            await userEvent.clear(textbox);
            await userEvent.type(textbox, NEW_VALUE); // change
            await userEvent.clear(textbox);
            await userEvent.type(textbox, OLD_VALUE); // revert
            await userEvent.keyboard("{Enter}");

            assert.isTrue(cancelSpy.notCalled, "onCancel called");
            assert.isTrue(confirmSpy.calledOnce, "onConfirm not called once");
            assert.isTrue(confirmSpy.calledWith(OLD_VALUE), `unexpected argument "${confirmSpy.args[0][0]}"`);
        });

        it("calls onEdit when entering edit mode and passes the initial value to the callback", async () => {
            const editSpy = spy();
            const INIT_VALUE = "hello";
            const { container } = render(<EditableText onEdit={editSpy} defaultValue={INIT_VALUE} />);
            const div = container.querySelector<HTMLElement>(`.${Classes.EDITABLE_TEXT}`);
            assert.isNotNull(div, "editable text container should exist");

            await userEvent.click(div!);

            assert.isTrue(editSpy.calledOnce, "onEdit called once");
            assert.isTrue(editSpy.calledWith(INIT_VALUE), `unexpected argument "${editSpy.args[0][0]}"`);
        });

        it("stops editing when disabled", () => {
            const { container } = render(<EditableText isEditing={true} disabled={true} />);
            const input = container.querySelector("input");
            assert.isNull(input, "input should not be rendered when disabled");
        });

        it("caret is placed at the end of the input box", () => {
            render(<EditableText isEditing={true} value="alphabet" />);
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");
            assert.strictEqual(textbox.selectionStart, 8);
            assert.strictEqual(textbox.selectionEnd, 8);
        });

        it("controlled mode can only change value via props", async () => {
            let expected = "alphabet";
            const { rerender } = render(<EditableText isEditing={true} value={expected} />);
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");

            await userEvent.type(textbox, "hello");
            assert.strictEqual(textbox.value, expected, "controlled mode can only change via props");

            expected = "hello world";
            rerender(<EditableText isEditing={true} value={expected} />);
            assert.strictEqual(textbox.value, expected, "controlled mode should be changeable via props");
        });

        it("applies defaultValue only on initial render", async () => {
            const { rerender } = render(
                <EditableText isEditing={true} defaultValue="default" placeholder="placeholder" />,
            );
            const textbox = screen.getByDisplayValue("default");

            // type new value, then change a prop to cause re-render
            await userEvent.clear(textbox);
            await userEvent.type(textbox, "hello");
            rerender(<EditableText isEditing={true} defaultValue="default" placeholder="new placeholder" />);
            assert.isNotNull(screen.queryByDisplayValue("hello"));
        });

        it("the full input box is highlighted when selectAllOnFocus is true", () => {
            render(<EditableText isEditing={true} selectAllOnFocus={true} value="alphabet" />);
            const textbox = screen.getByRole<HTMLTextAreaElement>("textbox");
            assert.strictEqual(textbox.selectionStart, 0);
            assert.strictEqual(textbox.selectionEnd, 8);
        });
    });

    describe("multiline", () => {
        it("renders a <textarea> when editing", () => {
            const { container } = render(<EditableText isEditing={true} multiline={true} />);
            const textarea = container.querySelector("textarea");
            assert.isNotNull(textarea, "textarea should be rendered");
        });

        it("does not call onConfirm when enter key is pressed", async () => {
            const confirmSpy = spy();
            const { container } = render(<EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} />);
            const textarea = container.querySelector("textarea")!;

            await userEvent.type(textarea, "hello");
            await userEvent.keyboard("{Enter}");

            assert.isTrue(confirmSpy.notCalled, "onConfirm called");
        });

        it("calls onConfirm when cmd+, ctrl+, shift+, or alt+ enter is pressed", async () => {
            const confirmSpy = spy();

            // Test ctrl+Enter
            const { container: container1, unmount: unmount1 } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} />,
            );
            const textarea1 = container1.querySelector("textarea")!;
            await userEvent.type(textarea1, "control");
            await userEvent.keyboard("{Control>}{Enter}{/Control}");
            assert.strictEqual(confirmSpy.callCount, 1, "onConfirm should be called after ctrl+enter");
            unmount1();

            // Test meta+Enter
            const { container: container2, unmount: unmount2 } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} />,
            );
            const textarea2 = container2.querySelector("textarea")!;
            await userEvent.type(textarea2, "meta");
            await userEvent.keyboard("{Meta>}{Enter}{/Meta}");
            assert.strictEqual(confirmSpy.callCount, 2, "onConfirm should be called after meta+enter");
            unmount2();

            // Test shift+Enter
            const { container: container3, unmount: unmount3 } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} />,
            );
            const textarea3 = container3.querySelector("textarea")!;
            await userEvent.type(textarea3, "shift");
            await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
            assert.strictEqual(confirmSpy.callCount, 3, "onConfirm should be called after shift+enter");
            unmount3();

            // Test alt+Enter
            const { container: container4 } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} />,
            );
            const textarea4 = container4.querySelector("textarea")!;
            await userEvent.type(textarea4, "alt");
            await userEvent.keyboard("{Alt>}{Enter}{/Alt}");
            assert.strictEqual(confirmSpy.callCount, 4, "onConfirm should be called after alt+enter");

            assert.strictEqual(confirmSpy.firstCall.args[0], "control");
            assert.strictEqual(confirmSpy.secondCall.args[0], "meta");
            assert.strictEqual(confirmSpy.thirdCall.args[0], "shift");
            assert.strictEqual(confirmSpy.lastCall.args[0], "alt");
        });

        it("confirmOnEnterKey={true} calls onConfirm when enter is pressed", async () => {
            const confirmSpy = spy();
            const { container } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} confirmOnEnterKey={true} />,
            );
            const textarea = container.querySelector("textarea")!;

            await userEvent.type(textarea, "control");
            await userEvent.keyboard("{Enter}");

            assert.isTrue(confirmSpy.calledOnce, "onConfirm not called");
            assert.strictEqual(confirmSpy.firstCall.args[0], "control");
        });

        it("confirmOnEnterKey={true} adds newline when cmd+, ctrl+, shift+, or alt+ enter is pressed", () => {
            const confirmSpy = spy();
            const { container } = render(
                <EditableText isEditing={true} onConfirm={confirmSpy} multiline={true} confirmOnEnterKey={true} />,
            );
            const textarea = container.querySelector("textarea")!;

            // Note: using fireEvent for precise control over modifier key combinations

            // Ctrl+Enter should add a newline, not confirm
            fireEvent.change(textarea, { target: { value: "" } });
            fireEvent.keyDown(textarea, { ctrlKey: true, key: "Enter" });
            assert.strictEqual(textarea.value, "\n");

            // Reset textarea value
            fireEvent.change(textarea, { target: { value: "" } });
            fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
            assert.strictEqual(textarea.value, "\n");

            // Reset textarea value
            fireEvent.change(textarea, { target: { value: "" } });
            fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
            assert.strictEqual(textarea.value, "\n");

            // Reset textarea value
            fireEvent.change(textarea, { target: { value: "" } });
            fireEvent.keyDown(textarea, { altKey: true, key: "Enter" });
            assert.strictEqual(textarea.value, "\n");

            // Should still be in editing mode (textarea should exist)
            assert.isNotNull(container.querySelector("textarea"), "should still be editing");
            assert.isTrue(confirmSpy.notCalled, "onConfirm called");
        });
    });

    describe("custom attributes", () => {
        const customProps = {
            "aria-label": "Edit description",
            "data-gramm": "false",
            spellCheck: false,
        };

        it("passes custom attributes to textarea when multiline is true", () => {
            const { container } = render(
                <EditableText isEditing={true} multiline={true} customInputAttributes={customProps} />,
            );
            const textarea = container.querySelector("textarea")!;
            assert.strictEqual(textarea.getAttribute("data-gramm"), "false");
            assert.strictEqual(textarea.getAttribute("spellcheck"), "false");
            assert.strictEqual(textarea.getAttribute("aria-label"), "Edit description");
        });

        it("passes custom attributes to input when multiline is false", () => {
            const { container } = render(
                <EditableText isEditing={true} multiline={false} customInputAttributes={customProps} />,
            );
            const input = container.querySelector("input")!;
            assert.strictEqual(input.getAttribute("data-gramm"), "false");
            assert.strictEqual(input.getAttribute("spellcheck"), "false");
            assert.strictEqual(input.getAttribute("aria-label"), "Edit description");
        });
    });
});
