import axios from 'axios';
import 'dotenv/config';
import puppeteer from 'puppeteer';

import { auth, sleep } from './helpers';
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
        await page.setRequestInterception(true)

        page.on('request', async (request) => {
            if (request.url().startsWith("https://axis.navitas.com/apps/timetable/timetable")) {
                console.log(request.headers());
                await request.continue();
                return;
            }
            (request.resourceType() === 'image' || request.resourceType() === "stylesheet")
                ? await request.abort()
                : await request.continue()
        })

        await page.goto(Pages.home, {
            waitUntil: 'networkidle2',
        });

        await getTimetable({ page });

        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();