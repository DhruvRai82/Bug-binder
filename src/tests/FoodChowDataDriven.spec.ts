import { test, expect } from '@playwright/test';

// 🔹 Test Data (Migrated from Java Object[][])
const testData = [
    { email: "testing1@tenacioustechies.com.au", pass: "123456", expectedSuccess: true },
    { email: "testing@tenacioustechies.com", pass: "123456", expectedSuccess: true },
    { email: "testing@tenacioustechies.com", pass: "wrongpass", expectedSuccess: false },
    { email: "invalidemail", pass: "123456", expectedSuccess: false },
    { email: "unknown@tenacioustechies.com", pass: "123456", expectedSuccess: false }
];

test.describe('FoodChow Data Driven Login', () => {

    for (const data of testData) {
        test(`Login with ${data.email} should be ${data.expectedSuccess ? 'Successful' : 'Failed'}`, async ({ page }) => {

            console.log(`\nTrying login: ${data.email}`);

            // 1. Navigate
            await page.goto('https://admin.foodchow.com/RestaurantLogin');

            // 2. Clear & Fill Email
            await page.locator('#txtEmailId').fill(data.email);

            // 3. Clear & Fill Password
            // Java used 'name=Password'
            await page.locator('input[name="Password"]').fill(data.pass);

            // 4. Click Login
            // Java used xpath //button[contains(.,'Login') or contains(.,'Sign in')]
            // Playwright 'text=' is cleaner
            await page.locator('button:has-text("Sign in")').click();
            // Note: The page likely says "Sign In" or "Login". Java xpath handled both. 
            // Let's use a robust locator.
            // await page.getByRole('button', { name: /Login|Sign in/i }).click();

            // 5. Wait for reaction
            // Explicit wait for URL or Element is better than sleep
            // But let's replicate logic: check for Logout button

            const logoutBtn = page.locator('#btn_logout');

            // We wait up to 5s for either success (Logout button) or failure (Error message/Still on page)
            // Since expectedSuccess dictates result.

            try {
                if (data.expectedSuccess) {
                    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
                    console.log("✅ Logged in successfully.");

                    // Logout
                    await logoutBtn.click();
                    await expect(page.locator('#txtEmailId')).toBeVisible();

                } else {
                    // Expect NOT to see logout
                    await expect(logoutBtn).not.toBeVisible({ timeout: 5000 });
                    console.log("✅ Login failed as expected.");
                }
            } catch (error) {
                console.log(`❌ Assertion Failed for ${data.email}`);
                throw error;
            }
        });
    }
});
