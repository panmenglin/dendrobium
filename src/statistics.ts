
import getGitConfig from './utils/getGitConfig';
import { StatisticsMessage } from './types';

export default async function statistics(params: StatisticsMessage) {
    const gitUser: any = await getGitConfig();

    if (!params.user) {
        params.user = gitUser;
    }
}