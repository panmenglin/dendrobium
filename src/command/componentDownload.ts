import * as vscode from 'vscode';
const path = require('path');
const { sep } = path;
const rimraf = require('rimraf');
const targz = require('targz');
const fs = require('fs');

import { ComponentConfig } from '../types';
import { getLatestTarball, downloadTemplate } from '../utils/utils';

export default async function componentDownload(
    component: ComponentConfig,
    downloadPath: string,
    intl: { get: (key: string) => string },
) {
    let componentName: string | undefined = component.importName instanceof Array ? component.name : component.importName;
    let componentPath = `${downloadPath}${sep}${componentName}`;

    function vaildComponentPath(path: string) {
        return new Promise(async (resolve) => {
            if (fs.existsSync(path)) {
                const answer = await vscode.window.showInformationMessage('组件目录已存在，是否覆盖？', intl.get('yes'), '重命名');

                if (answer !== intl.get('yes')) {
                    const folderName = await vscode.window.showInputBox({
                        ignoreFocusOut: true,
                        prompt: '请重新输入文件夹名称',
                        value: '',
                    });

                    if (!folderName) {
                        resolve(false);
                    } else {
                        componentPath = `${downloadPath}${sep}${folderName}`;
                        if (fs.existsSync(componentPath)) {
                            const res = await vaildComponentPath(componentPath);
                            resolve(res);
                        } else {
                            resolve(true);
                        }
                    }
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    }

    const res = await vaildComponentPath(componentPath);

    if (!res) {
        return;
    }

    const download = (progress: any) => {
        return new Promise(async (resolve) => {

            progress.report({ increment: 30, message: intl.get('downloading') });

            const downloadUrl: string = component.installMethod?.download.match(/(.+\.(tgz|zip))/g) ? component.installMethod?.download : await getLatestTarball(component.installMethod?.download);

            await downloadTemplate(downloadUrl, `${downloadPath}${sep}${componentName}.tgz`);

            progress.report({ increment: 60, message: intl.get('unzipping') });

            const tgzFileName = `${downloadPath}${sep}${componentName}.tgz`;
            rimraf.sync(componentPath);

            targz.decompress(
                {
                    src: tgzFileName,
                    dest: `${componentPath}`,
                    tar: {
                        readable: true,
                        writable: true
                    }
                },
                async function (err: any) {

                    const packageJsonPath = `${componentPath}${sep}package.json`;
                    let packageJson = '';
                    if (fs.existsSync(packageJsonPath)) {
                        packageJson = fs.readFileSync(packageJsonPath, 'utf-8');

                        if (packageJson) {
                            packageJson = JSON.parse(packageJson);
                        }
                    }

                    rimraf.sync(tgzFileName);
                }
            );

            resolve(true);
        });
    };

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: intl.get('loadingInstall'),
    }, async (progress: any) => {
        download(progress);
    });
};