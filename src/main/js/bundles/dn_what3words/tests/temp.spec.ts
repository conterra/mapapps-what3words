///
/// Copyright (C) 2023 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/*
 * Copyright (C) con terra GmbH
 */
import { Page, test } from "@playwright/test";
import { expectToMatchScreenshot, waitForMap } from "./common/testUtils";


class SearchUiSampleApp {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    async goto(): Promise<void> {
        await this.page.goto('http://localhost:9090/');
        await this.page.getByRole("button", { name: "Fenster schließen"}).click();
    }

    async search(searchString: string): Promise<void> {
        await this.page.getByPlaceholder("Suche nach").click();
        await this.page.getByPlaceholder("Suche nach").fill(searchString);
    }

    async showSearchResult(searchResult: string): Promise<void> {
        await this.page.getByRole("option", { name: searchResult }).click();
        await waitForMap(this.page);
    }
}

test("expect search-ui can be used to find Berlin", async ({ page }) => {
    const sampleApp = new SearchUiSampleApp(page);
    await sampleApp.goto();

    await sampleApp.search("Berlin");
    await sampleApp.showSearchResult("Berlin, Stadt in Gemeinden in");

    await expectToMatchScreenshot(page, "expect-search-ui-can-be-used-to-find-Berlin.png", {
        timeout: 10000
    });
});
