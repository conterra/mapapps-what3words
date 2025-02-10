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

import { test, expect } from '@playwright/test';
import { expectToMatchScreenshot } from './common/testUtils';

// test('has title', async ({ page }) => {
//     await page.goto('https://playwright.dev/');

//     // Expect a title "to contain" a substring.
//     await expect(page).toHaveTitle(/Playwright/);
// });

test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');

    // Click the get started link.
    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


test('has title', async ({ page }) => {
    await page.goto('http://localhost:9090/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/sample/);
});

test('expect search-ui can be used to find Berlin', async ({ page }) => {
    await page.goto('http://localhost:9090/');

    await expectToMatchScreenshot(page, "expect-search-ui-can-be-used-to-find-Berlin.png", {
        timeout: 10000
    });
});
