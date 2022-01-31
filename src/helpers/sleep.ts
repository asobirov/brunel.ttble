import { Page } from "puppeteer"

export const sleep = async (options: { page?: Page, min?: number, max?: number }) => {
    const { page, min = 1500, max = 5000 } = options;
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`~ Sleeping for ${ms}ms ~`);
    if (page) {
        await page.waitForTimeout(ms);
    } else {
        return ms;
    }
    return;
}