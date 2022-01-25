import 'dotenv/config';
import puppeteer, { Browser } from 'puppeteer';

import { getTimetable } from './helpers/timetable';
import { Pages } from './types/pages';

(async () => {
    try {
        console.log('Launching browser...');
        var browser: Browser | undefined = await puppeteer.launch({
            headless: process.env.CI === "true",
            executablePath: '/usr/bin/chromium-browser'
        });


        console.log('Creating page...');
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
        if (browser) {
            await browser.close();
        }
    }
})();