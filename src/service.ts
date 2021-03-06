import requestSingleton from './utils/request';
import { workspace } from 'vscode';
import { StatisticsConfig } from './types';

export function report(reportVariable: any) {
    const statisticsConfig: StatisticsConfig | undefined = workspace.getConfiguration().get('dendrobium.statistics');

    if (!statisticsConfig || !statisticsConfig.reportApi || !statisticsConfig.reportApi.url) {
        return;
    }

    const { reportApi } = statisticsConfig;
    const defaultFormat: {
        [propName: string]: string;
    } = {
        "type": "$TYPE",
        "message": "$MESSAGE",
        "wareHouse": "$WAREHOUSE",
        "blockName": "$BLOCKNAME",
        "blockKey": "$BLOCKKEY",
    };

    const body = reportApi.format || defaultFormat;

    Object.keys(body).forEach(key => {
        const value = reportVariable[body[key]];
        if (value) {
            body[key] = value;
        } else if (body[key] === defaultFormat[key]) {
            body[key] = '';
        }
    });

    const request = requestSingleton();
    return request(reportApi.url, {
        method: reportApi.method || 'POST',
        body
    });
}