import { Page } from "puppeteer";
import axios from "axios";
import { Pages } from "../types/pages";
import { auth, sleep } from ".";
import { Course } from "../types/course";
import { writeTtble } from "./write";

export const getTimetable = async (options: { page: Page, start?: number, end?: number }) => {
    try {
        const { page } = options;
        let { start, end } = options;

        await auth({ page });
        await sleep({ page });

        await page.goto(Pages.timetable, {
            waitUntil: 'networkidle2',
        });

        const startDate = start ? new Date(start) : new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        startDate.setUTCHours(0, 0, 0, 0);
        start = startDate.getTime();
        console.log(new Date(start).toLocaleString());

        end = end ? new Date(end).getTime() : start + (2 * 30 * 24 * 60 * 60 * 1000);

        console.log(`Getting timetable from ${new Date(start).toDateString()} to ${new Date(end).toDateString()}`);

        const ttbleCookies = await page.cookies();
        const ttbleRes = await axios.get(`${Pages.timetable}/timetable?start=${start}&end=${end}`, {
            headers: {
                Cookie: ttbleCookies.map(c => `${c.name}=${c.value}`).join('; '),
                Accept: "application/json, text/javascript, */*; q=0.01",
                'x-requested-with': 'XMLHttpRequest',
            },
            withCredentials: true,
        });

        await writeTtble(ttbleRes.data);
        console.log('Finished parsing timetable.');
    } catch (error: any) {
        throw {
            message: 'Could not get timetable.',
            reason: error,
        }
    }
}