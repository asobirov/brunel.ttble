import { Page } from "puppeteer";

import { Pages } from "../types/pages";
import { LogType } from "../types/log";

import { sleep, goto, log, handleModal, writeCourses } from "../helpers";

export const getCourses = async (options: { page: Page, start?: number, end?: number }) => {
    try {
        log('Starting to parse course modules...', LogType.blockStart);
        const { page } = options;

        await goto({ page, href: Pages.moodleMain, waitUntil: 'networkidle0' });

        await writeCourses(await getCoursesData({
            page,
            courseIds: await getCourseIds({ page })
        }));


        log('Finished parsing timetable.', LogType.blockEnd);
    } catch (error: any) {
        throw {
            message: 'Could not get timetable.',
            reason: error,
        }
    }
}

const getCourseIds = async (options: { page: Page }) => {
    const { page } = options;

    log('Getting course ids...', LogType.blockStart);

    log('Finding courses deck', LogType.start);
    const coursesDeck = (await page.$x('//div[contains(@class, "card-deck dashboard-card-deck")]'))[0];
    log('Found courses deck', LogType.end);

    log('Iterating through courses', LogType.start);
    const courseIds = (await coursesDeck.$$eval("div.card", el => el.map(e => e.getAttribute('data-course-id'))))
        .filter(<T>(v: T | null | undefined): v is T => v !== null && v !== undefined)
    log('Finished iterating through courses', LogType.end);
    console.log('> Fetched ids: ' + JSON.stringify(courseIds));

    log('Finished parsing course ids.', LogType.blockEnd);

    return courseIds ?? [];
}

const getCoursesData = async (options: { page: Page, courseIds: string[] }) => {
    const { page, courseIds } = options;

    log('Parsing courses data...', LogType.blockStart);

    const coursesData: any[] = [];

    for (const courseId of courseIds) {
        coursesData.push(await getCourseDataById({ page, courseId }));
    }

    log('Finished parsing courses data.', LogType.blockEnd);
    return coursesData;

}

const getCourseDataById = async (options: { page: Page, courseId: string }) => {
    const { page, courseId } = options;

    try {
        await sleep({ page });

        log(`Parsing course [${courseId}] data...`, LogType.blockStart);
        await goto({ page, href: `${Pages.course}${courseId}`, waitUntil: 'networkidle0' });

        await handleModal({ page });

        const tiles = await page.$x("//ul[@class='tiles']/li[contains(@class, 'tile') and not(contains(@class, 'spacer'))]");

        log('Opening every second course tile...', LogType.start);
        for (let i = 0; i < tiles.length; i += 2) {
            await sleep({ page, min: 1000, max: 2000 });
            await tiles[i].click();
        }
        log('Finished opening course tiles.', LogType.end);

        log('Parsing course sections...', LogType.start);

        const sections = await page.$x("//ul[@class='tiles']/li[contains(@class, 'section')]/div[contains(@class, 'content')]");

        const sectionsData = [];
        const zoomUrls: string[] = [];
        for (const section of sections) {
            // get text of span with class 'sectionname that is located inside sectionInner
            const sectionTitle = (await section.$$eval("div.pagesechead .sectiontitle > h2", el => el.map(e => e.textContent)))[0]?.trim() ?? '';


            if (sectionTitle.toLowerCase().includes('zoom')) {
                // check if any li data-title contains 'Group 6'
                // return .section > .activity elements 
                const moodleZoomLinkIds = (await section.$$eval(".section > .activity", (els) =>
                    els.filter((e) =>
                        e.getAttribute('data-title')?.includes('Group 6') ?? false
                    ).map((e) => e.getAttribute('data-cmid'))
                )).filter(<T>(v: T | null | undefined): v is T => v !== null && v !== undefined);

                log(`Fetched zoom link ids for ${courseId}: ${JSON.stringify(moodleZoomLinkIds)}`, LogType.start);
                for (const id of moodleZoomLinkIds) {
                    zoomUrls.push(await getZoomLinkById({ page, moodleId: id }));
                }
            }

            sectionsData.push({
                title: sectionTitle,
            });
        }

        log(`Finished parsing course (id: ${courseId}) data.`, LogType.blockEnd);

        return {
            id: courseId,
            zoomUrls: zoomUrls,
            sections: sectionsData
        }
    } catch (error: any) {
        throw {
            message: `Could not get course ${courseId} data.`,
            reason: error,
        }
    }
}

const getZoomLinkById = async (options: { page: Page, moodleId: string }) => {
    const { page, moodleId } = options;
    await goto({ page, href: `${Pages.zoom}${moodleId}` });
    await (await page.$$("form[action='https://moodle.libt.navitas.com/mod/ncmzoom/loadmeeting.php'] > button[type='submit']"))[0].click();
    await sleep({ page, min: 1000, max: 2000 });
    console.log(page.url())
    return page.url();

}