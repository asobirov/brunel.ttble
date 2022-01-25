import { Page } from "puppeteer"
import { sleep } from ".";
import { Pages } from "../types/pages";

export const auth = async (options: { page: Page, min?: number, max?: number }) => {
    try {
        const { page, min, max } = options;

        await sleep({ page, min, max });

        console.warn("Checking if logged in...");
        if (!page.url().startsWith(Pages.login)) {
            console.log('Yeap, already logged in.');
            return;
        }
        console.log("Not logged in, logging in...");
        const SAMLToken = await page.$x('//input[@name="SAMLRequest"]');
        const usernameInput = await page.$x(`//input[@name='username']`);
        const passwordInput = await page.$x(`//input[@name='password']`);
        const loginButton = await page.$x(`//input[@type='submit']`);

        if (!SAMLToken || !usernameInput || !passwordInput || !loginButton) {
            throw 'Could not find login form.';
        }

        const username = process.env.USERNAME;
        const password = process.env.PASSWORD;

        if (!username || !password) {
            throw 'Please provide a username and password in the .env file';
        }

        usernameInput.length > 0 && await usernameInput[0].type(username, { delay: 100 });
        passwordInput.length > 0 && await passwordInput[0].type(password);

        loginButton.length > 0 && await loginButton[0].click();

        console.log("Logged in successfully.");
        return { SAMLToken };
    } catch (error: any) {
        throw {
            message: 'Could not log in.',
            reason: error && error.message,
        }
    }
}