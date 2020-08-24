
import getGitConfig from './utils/getGitConfig';
import { StatisticsMessage } from './types';

import localize from './locales';
const intl = localize('zh-cn');

export default async function statistics(params: StatisticsMessage) {
    const gitUser: any = await getGitConfig(undefined, intl);

    if (!params.user) {
        params.user = gitUser;
    }
}