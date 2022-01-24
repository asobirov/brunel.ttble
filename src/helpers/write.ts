import * as fs from 'fs';
import { Course } from "../types/course";

export const writeTtble = async (data: Course[]) => {
    const json = JSON.stringify(data, null, 2);
    
    console.log(json);
    console.log('Starting to write to file...');

    const fd = fs.openSync(__dirname + '/../../data/ttble.json', 'w');

    const existingData = fs.readFileSync(__dirname + '/../../data/ttble.json', 'utf8');
    if (existingData === json) {
        console.log('No changes to timetable data.');
        return;
    }

    if (existingData) {
        const existingDataJSON = JSON.parse(existingData.toString());
        const newData = [...existingDataJSON, ...data];
        fs.writeFileSync(__dirname + '/../../data/ttble.json', JSON.stringify(newData, null, 2));
    } else {
        fs.writeFileSync(__dirname + '/../../data/ttble.json', json);
    }
    fs.closeSync(fd);
    console.log('Finished writing to file.');
}