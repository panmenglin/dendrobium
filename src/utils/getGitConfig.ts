import { actuator } from './utils';
const chalk = require('chalk');
import { window } from 'vscode';

/**
 * getGitConfig
 * @description git git config
 */
export default function getGitConfig (cwd?: string, intl?: { get: (key: string) => void }) {
    const cmdActuator = new actuator({
        cwd,
    }, (error) => { });

    return new Promise(async (resolve, reject) => {
        const user = {
            name: '',
            email: ''
        };

        try {
            const name = await cmdActuator.run('git config user.name');
            const email = await cmdActuator.run('git config user.email');

            if (name) {
                user.name = name.replace(/\n/g, '');
            }

            if (email) {
                user.email = `<${email || ''}>`.replace(/\n/g, '');
            }

        } catch (error) {
            console.error('get git config failed');
            if (intl) {
                window.showErrorMessage(chalk.red(intl.get('gitConfigFailed')));
            } else {

            }

            reject(error);
        } finally {
            resolve(user);
        }
    });
}