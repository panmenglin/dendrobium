
import getGitConfig from './utils/getGitConfig';
import { StatisticsMessage } from './types';
import { report } from './service';
const chalk = require('chalk');
import { window } from 'vscode';

import localize from './locales';
const intl = localize('zh-cn');

export default async function statistics(params: StatisticsMessage) {
    const gitUser: any = await getGitConfig(undefined, intl);

    const typeCode = {
        'view': 0,
        'install': 1,
        'docView': 2,
        'snippetInsert': 3
    };

    const reportParams = {
        userName: gitUser?.name || '',
        email: gitUser?.email || '',
        libraryName: params.library?.name,
        libraryCode: params.library?.code,
        componentName: params.component.name,
        componentCode: params.component.code,
        component: params.component,
        library: params.library,
        type: typeCode[params.type],
    };

    // report
    report(reportParams)?.then(() => {

    }, (err) => {
        window.showErrorMessage(chalk.red(`🚧 ${err}`));
    });
}