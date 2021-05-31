import requestSingleton from './utils/request';
import { workspace } from 'vscode';
import { StatisticsConfig, LibrarysConfig, ReportVariable } from './types';

const request = requestSingleton();

export function report(reportVariable: ReportVariable) {
    const statisticsConfig: StatisticsConfig | undefined = workspace.getConfiguration().get('dendrobium.statistics');

    if (!statisticsConfig || !statisticsConfig.reportApi || !statisticsConfig.reportApi.url) {
        return;
    }

    const { reportApi } = statisticsConfig;

    return request(reportApi.url, {
        method: reportApi.method || 'POST',
        body: reportVariable
    });
}

/**
 * fetch library config
 * @returns
 */
export function getLibrary(params?: {
    path?: string,
    librarysConfig: LibrarysConfig
}) {

    if (!params?.librarysConfig) {
        return;
    }

    const url = params?.path ? `${params.librarysConfig.rootPath}${params?.path}` : params.librarysConfig.configPath;
    return request(url, {
        method: 'GET',
    });
}

export function getSnippets(params: { path: string }) {
    return request(params.path, {
        method: 'GET',
    });
}

export function getConfig(params: { path: string }) {
    return request(params.path, {
        method: 'GET',
    });
}