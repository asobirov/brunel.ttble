import { Page } from "puppeteer";
import { sleep } from ".";
import { LogType } from "../types/log";
import { log } from "./log";

export const handleModal = async (options: { page: Page }) => {
    try {
        const { page } = options;
        
        await sleep({ page });

        log("Checking if any modal windows are present...", LogType.blockStart);
        const modal = await page.$x('//div[contains(@class, "modal-footer")]');

        if (modal.length > 0) {
            log("Found modal window, closing it...", LogType.end);
            await page.click('button[data-action="save"]');
        }

        log("Finished checking for modal windows.", LogType.blockEnd);
    } catch (error: any) {
        throw {
            message: 'Could not handle modal.',
            reason: error.message || error,
        }
    }
}