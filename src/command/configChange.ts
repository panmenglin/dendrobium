/**
 * 修改配置文件地址
 */
import { Memento, ExtensionContext, window } from 'vscode';

export default async function configChange(
    context: ExtensionContext,
    state: Memento,
    intl: { get: (key: string) => string }
) {
    return new Promise(async (resolve, reject) => {

        const defaultValue: string | undefined = state.get('configPath');

        const configPath = await window.showInputBox({
            ignoreFocusOut: true,
            prompt: '请输入配置文件地址',
            value: defaultValue || '',
        });

        if (!configPath) {
            reject(false);
            return;
        }

        state.update('configPath', configPath);

        resolve(true);
    });
}
