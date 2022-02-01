import { Page } from "puppeteer"
import { LogType } from "../types/log";
import { sleep } from ".";
import { Pages } from "../types/pages";
import { log } from "./log";

export const auth = async (options: { page: Page, min?: number, max?: number }) => {
    try {
        const { page, min, max } = options;

        await sleep({ page, min, max });

        log("Checking if logged in...", LogType.blockStart);
        if (!page.url().startsWith(Pages.login)) {
            log('Yeap, already logged in.', LogType.blockEnd);
            return;
        }
        log("Not logged in, logging in...", LogType.end);
        const SAMLToken = await page.$x('//input[@name="SAMLRequest"]');
        const usernameInput = await page.$x(`//input[@name='username']`);
        const passwordInput = await page.$x(`//input[@name='password']`);
        const loginButton = await page.$x(`//input[@type='submit']`);

        if (!SAMLToken || !usernameInput || !passwordInput || !loginButton) {
            throw 'Could not find login form.';
        }

        log("Found all login form elements.", LogType.end);

        const username = process.env.USERNAME;
        const password = process.env.PASSWORD;

        if (!username || !password) {
            throw 'Please provide a username and password in the .env file';
        }

        usernameInput.length > 0 && await usernameInput[0].type(username, { delay: 100 });
        passwordInput.length > 0 && await passwordInput[0].type(password);

        loginButton.length > 0 && await loginButton[0].click();

        log("Logged in successfully.", LogType.blockEnd);
        return { SAMLToken };
    } catch (error: any) {
        throw {
            message: 'Could not log in.',
            reason: error.message || error,
        }
    }
}