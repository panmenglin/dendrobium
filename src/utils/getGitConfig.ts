import { actuator } from './utils';

/**
 * getGitConfig
 * @description git git config
 */
export default function getGitConfig (cwd: string) {
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
            reject(error);
        } finally {
            resolve(user);
        }
    });
}