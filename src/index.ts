import 'dotenv/config';
import puppeteer from 'puppeteer';

import { getTimetable } from './helpers/timetable';
import { Pages } from './types/pages';

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
        });

        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
        });

        await page.goto(Pages.home, {
            waitUntil: 'networkidle2'
        });

        await getTimetable({ page });

        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();