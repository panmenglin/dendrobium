import requestSingleton from './utils/request';
import { workspace } from 'vscode';
import { StatisticsConfig, LibrarysConfig } from './types';

const request = requestSingleton();

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

    return request(reportApi.url, {
        method: reportApi.method || 'POST',
        body
    });
}

/**
 * fetch library config
 * @returns 
 */
export function getLibrary(params?: { path: string }) {
    const libraryConfig: LibrarysConfig | undefined = workspace.getConfiguration().get('dendrobium.librarysConfig');

    if (!libraryConfig) {
        return;
    }

    const url = params?.path ? `${libraryConfig.rootPath}${params?.path}` : libraryConfig.configPath;
    return request(url, {
        method: 'GET',
    });
}

export function getSnippets(params: { path: string }) {

    return request(params.path, {
        method: 'GET',
    });
}