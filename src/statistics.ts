
import getGitConfig from './utils/getGitConfig';
import { StatisticsMessage } from './types';
import { report } from './service';
const chalk = require('chalk');
import { window } from 'vscode';

import localize from './locales';
const intl = localize('zh-cn');

export default async function statistics(params: StatisticsMessage) {
    const gitUser: any = await getGitConfig(undefined, intl);

    if (!params.user) {
        params.user = gitUser;
    }

    const { type, message, block } = params;
    const { wareHouse, title, key } = block;

    const reportVariable = {
        $TYPE: type,
        $MESSAGE: message,
        $WAREHOUSE: wareHouse ? wareHouse.downloadUrl : '',
        $BLOCKNAME: title,
        $BLOCKKEY: key
    };


    // report
    report(reportVariable)?.then(() => {

    }, (err) => {
        window.showErrorMessage(chalk.red(`🚧 ${err}`));
    });
}