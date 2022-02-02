import { Page } from "puppeteer";
import { Pages } from "../types/pages";
import { auth, sleep } from "../helpers";
import { log } from "../helpers/log";
import { LogType } from "../types/log";
import { goto } from "../helpers/goto";

export const getCourses = async (options: { page: Page, start?: number, end?: number }) => {
    try {
        log('Starting to parse course modules...', LogType.blockStart);
        const { page } = options;

        await goto({ page, href: Pages.moodleMain, waitUntil: 'networkidle0' });

        const courseIds = (await getCourseIds({ page }));
        const courses = await getCoursesData({ page, courseIds });
        await sleep({ page });

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

    const coursesData: any[] = []
    for (const courseId of courseIds) {
        coursesData.push(await getCourseDataById({ page, courseId }));
    }

    return {
        coursesData
    }

}

const getCourseDataById = async (options: { page: Page, courseId: string }) => {
    const { page, courseId } = options;

    log(`Getting course (id: ${courseId}) data...`, LogType.blockStart);

    await goto({ page, href: `${Pages.course}${courseId}`, waitUntil: 'networkidle0' });

    const tiles = await page.$x("//ul[@class='tiles']/li[contains(@class, 'tile') and not(contains(@class, 'spacer'))]");

    log('Pressing to course tiles...', LogType.start);
    for (let i = 0; i < tiles.length; i += 2) {
        await tiles[i].click();
    }
    log('Finished pressing to course tiles.', LogType.end);

    log('Parsing course sections...', LogType.start);

    const sections = await page.$x("//ul[@class='tiles']/li[contains(@class, 'section')]/div[contains(@class, 'content')]");
    let sectionsData = [];//*[@id="page-course-view-tiles"]/div[6]/div[2]/div/div/div[3]/button[1]

    for (const section of sections) {
        const name = await (await (await section.$x("//span[contains(@class, 'sectionname')]"))[0].getProperty('textContent'))._remoteObject.value;
        console.log("Section NAME: " + name);
    }

    log(`Finished parsing course (id: ${courseId}) data.`, LogType.blockEnd);

    return {
    }
}
