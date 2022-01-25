import 'dotenv/config';

import puppeteer from 'puppeteer-extra';
import { Browser } from 'puppeteer';

import { getTimetable } from './helpers/timetable';
import { Pages } from './types/pages';

(async () => {
    try {

        console.log("Setting up stealth plugin.");
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());

        console.log('Launching browser...');
        var browser: Browser | undefined = await puppeteer.launch({
            // headless: true,
            executablePath: '/usr/bin/chromium-browser',
            // args: ['--proxy-server=http://10.10.10.10:8080']
        });
        console.log('Browser launched.');

        console.log('Creating a page...');
        const page = (await browser.pages())[0];
        console.log('Page created.');

        await page.goto(Pages.home, {
            waitUntil: 'networkidle2'
        });

        console.log('Fetching timetable...');
        await getTimetable({ page });

        await browser.close();
    } catch (e) {
        console.error(e);
        if (browser) {
            await browser.close();
        }
    }
})();