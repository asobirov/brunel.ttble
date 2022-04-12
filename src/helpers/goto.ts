import { Page, PuppeteerLifeCycleEvent } from "puppeteer"
import { auth, sleep } from ".";

import { LogType } from "../types/log";
import { log } from "./log";

export const goto = async (option: { page: Page, href: string, waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[] }) => {
    const { page, href, waitUntil } = option;

    log('Navigating to ' + href, LogType.blockStart);
    await page.goto(href, {
        waitUntil: waitUntil
    });

    await auth({ page, min: 2500 });
    await sleep({ page });

    if (page.url().startsWith(href)) {
        log('Successfully navigated to ' + href, LogType.blockEnd);
    } else {
        log('Could not navigate to ' + href + '(Unmatched urls)', LogType.error);
    }
}