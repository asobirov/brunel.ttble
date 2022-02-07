import 'dotenv/config';

import puppeteer from 'puppeteer-extra';
import { Browser } from 'puppeteer';

import { getTimetable } from './funcs/timetable';
import { Pages } from './types/pages';
import { log } from './helpers/log';
import { LogType } from './types/log';
import { getCourses } from './funcs/courses';
import { goto } from './helpers/goto';

(async () => {
    try {

        log("Setting up stealth plugin.", LogType.start);
        const StealthPlugin = require('puppeteer-extra-plugin-stealth');
        puppeteer.use(StealthPlugin());
        log("Finished setting up stealth plugin.", LogType.end);

        log('Launching browser...', LogType.start);
        var browser: Browser | undefined = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: ['--use-gl=egl'],
            // devtools: true
            // args: ['--proxy-server=http://10.10.10.10:8080']
        });
        log('Browser launched.', LogType.end);

        log('Creating initial page...', LogType.start);
        const page = (await browser.pages())[0];
        log('Page created successfully.', LogType.end);

        await goto({ page, href: Pages.home, waitUntil: 'networkidle2' });

        await getTimetable({ page });

        // await getCourses({ page });

        await browser.close();
        log('Browser closed.', LogType.blockEnd);
    } catch (e) {
        console.error(e);
        if (browser) {
            await browser.close();
        }
    }
})();