/*
 * Copyright 2024 Palantir Technologies, Inc. All rights reserved.
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
import { assert } from "chai";

import { Classes, EntityTitle, H5 } from "../../src";
import { Tag } from "../../src/index";
import { hasClass } from "../utils";

describe("<EntityTitle>", () => {
    it("supports className", () => {
        const { container } = render(<EntityTitle className="foo" title="title" />);
        const h5 = container.querySelector("h5");
        assert.isNull(h5, "expected no H5");
        const foo = container.querySelector(".foo");
        assert.isNotNull(foo);
    });

    it("renders title", () => {
        render(<EntityTitle title="title" />);
        const title = screen.getByText<HTMLDivElement>("title");
        assert.isTrue(hasClass(title, Classes.ENTITY_TITLE_TITLE));
    });

    it("renders title in heading", () => {
        render(<EntityTitle heading={H5} title="title" />);
        const title = screen.getByText<HTMLHeadingElement>("title");
        assert.equal(title.tagName.toLowerCase(), "h5");
    });

    it("supports icon", () => {
        const { container } = render(<EntityTitle icon="graph" title="title" />);
        const icon = container.querySelector(`[data-icon="graph"]`);
        assert.isNotNull(icon);
    });

    it("omitting icon prop removes icon from DOM", () => {
        const { container } = render(<EntityTitle title="title" />);
        const icon = container.querySelector("[data-icon]");
        assert.isNull(icon);
    });

    it("supports tag", () => {
        render(<EntityTitle title="title" tags={<Tag>tag</Tag>} />);
        const tag = screen.getByText<HTMLDivElement>("tag");
        assert.isNotNull(tag);
    });

    it("renders optional subtitle element", () => {
        render(<EntityTitle title="title" subtitle="subtitle" />);
        const subtitle = screen.getByText<HTMLDivElement>("subtitle");
        assert.isNotNull(subtitle);
    });

    it("renders title in an anchor", () => {
        render(<EntityTitle title="title" titleURL="https://blueprintjs.com/" />);
        const title = screen.getByText<HTMLAnchorElement>("title");
        assert.equal(title.tagName.toLowerCase(), "a");
        assert.equal(title.href, "https://blueprintjs.com/");
    });

    it("supports ellipsize on Text", () => {
        render(<EntityTitle title="title" ellipsize={true} />);
        const title = screen.getByText<HTMLDivElement>("title");
        assert.isTrue(hasClass(title, Classes.TEXT_OVERFLOW_ELLIPSIS));
    });

    it("supports ellipsize on heading", () => {
        render(<EntityTitle title="title" ellipsize={true} heading={H5} />);
        const title = screen.getByText<HTMLHeadingElement>("title");
        assert.isTrue(hasClass(title, Classes.TEXT_OVERFLOW_ELLIPSIS));
    });

    it("supports fill", () => {
        const { container } = render(<EntityTitle title="title" fill={true} />);
        const fill = container.querySelector<HTMLElement>(`.${Classes.FILL}`);
        assert.isNotNull(fill);
    });

    it("supports loading", () => {
        render(<EntityTitle title="title" loading={true} />);
        const title = screen.getByText<HTMLDivElement>("title");
        assert.isTrue(hasClass(title, Classes.SKELETON));
    });
});
