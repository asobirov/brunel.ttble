import * as fs from 'fs';
import { LogType } from '../types/log';
import { Course } from "../types/course";
import { log } from './log';
import path from 'path';

export const writeTtble = async (data: Course[]) => {
    const json = JSON.stringify(data, null, 2);

    // console.log(json);
    log('Saving the provided timetable...', LogType.blockStart);

    // const fd = fs.openSync(__dirname + '/../../data/ttble.json', 'w');

    // read ttble.json data
    const existingData = fs.readFileSync(path.resolve(__dirname, '../../data/ttble.json'), 'utf8');
    if (existingData === json) {
        log('Finished saving. No changes were made to the timetable data.', LogType.end);
        return;
    }

    if (existingData) {
        log('Found existing timetable data. Merging...', LogType.start);
        const existingDataJSON = JSON.parse(existingData)
        let filteredData: Course[] = [...data];

        existingDataJSON.forEach((c: Course) => {
            if (data.find(d => d.start === c.start)) {
                console.log('Found existing course with the same start time.');
                return;
            }
            filteredData.push(c);
        });

        const mergedData = [...filteredData, ...data];
        fs.writeFileSync(__dirname + '/../../data/ttble.json', JSON.stringify(mergedData, null, 2));
    } else {
        fs.writeFileSync(__dirname + '/../../data/ttble.json', json);
    }
    // fs.closeSync(fd);
    log('Finished saving timetable.', LogType.end);
}


export const writeCourses = async (data: any) => {

}