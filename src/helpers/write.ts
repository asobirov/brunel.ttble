import * as fs from 'fs';
import { LogType } from '../types/log';
import { Course } from "../types/course";
import { log } from './log';

export const writeTtble = async (data: Course[]) => {
    const json = JSON.stringify(data, null, 2);

    // console.log(json);
    log('Saving the provided timetable...', LogType.blockStart);

    const fd = fs.openSync(__dirname + '/../../data/ttble.json', 'w');

    const existingData = fs.readFileSync(__dirname + '/../../data/ttble.json', 'utf8');
    if (existingData === json) {
        log('Finished saving. No changes were made to the timetable data.', LogType.end);
        return;
    }

    if (existingData) {
        const existingDataJSON = JSON.parse(existingData.toString());
        let newData: Course[] = [];

        existingDataJSON.forEach((c: Course) => {
            if (!data.find(d => d.start === c.start)) {
                newData.push(c);
            }
        });
        fs.writeFileSync(__dirname + '/../../data/ttble.json', JSON.stringify(newData, null, 2));
    } else {
        fs.writeFileSync(__dirname + '/../../data/ttble.json', json);
    }
    fs.closeSync(fd);
    log('Finished saving timetable.', LogType.end);
}