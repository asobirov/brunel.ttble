import { LogType } from "../types/log"

export const log = (text: string, type: LogType | undefined = LogType.start) => {
    switch (type) {
        case LogType.start:
            console.log(`> ${text}`);
            break;
        case LogType.end:
            console.log(`  ${text}`);
            break;
        case LogType.blockStart:
            console.groupCollapsed(`+ ${text} +`);
            break;
        case LogType.blockEnd:
            console.groupEnd();
            console.log(`x ${text} x`);
            break;
        case LogType.error:
            console.error(`! ${text} !`);
        default:
            console.log(`  ${text}`);
            break;
    }
}

