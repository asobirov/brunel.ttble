import { Page } from "puppeteer";
import { Pages } from "../types/pages";
import { auth, sleep } from ".";
import { writeTtble } from "./write";
import { log } from "./log";
import { LogType } from "../types/log";

export const getTimetable = async (options: { page: Page, start?: number, end?: number }) => {
    try {
        log('Starting to parse timetable...', LogType.blockStart);
        const { page } = options;

        await auth({ page });
        await sleep({ page });

        await page.goto(Pages.timetable);

        await writeTtble(await (await getTtbleRes({ page })).ttbleRes.json());
        await sleep({ page });

        log('Switching to the next month...', LogType.start);
        const nextWeekButton = (await page.$x('//span[contains(@class,"fc-button fc-button-next fc-state-default fc-corner-right")]'))[0];
        await nextWeekButton.click();

        await writeTtble(await (await getTtbleRes({ page })).ttbleData);

        log('Finished parsing timetable.', LogType.blockEnd);
    } catch (error: any) {
        throw {
            message: 'Could not get timetable.',
            reason: error,
        }
    }
}

export const getTtbleRes = async (options: { page: Page }) => {
    const { page } = options;
    const ttbleRes = await page.waitForResponse(res => res.url().startsWith('https://axis.navitas.com/apps/timetable/timetable') && res.status() === 200);
    const ttbleData = await ttbleRes.json();

    const [_, date] = ttbleRes.url().split('?');
    const [startDate, endDate] = date.split('&');
    const start = new Date(+startDate.split('=')[1] * 1000);
    const end = new Date(+endDate.split('=')[1] * 1000);

    console.log(`> Fetched ${(ttbleRes && ttbleData.lenght) || 'empty'} timetable for ${start.toLocaleString()} to ${end.toLocaleString()}`);

    return {
        ttbleRes,
        ttbleData,
        start,
        end,
    }
}