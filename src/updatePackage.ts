import * as vscode from 'vscode';
import { getRootPath } from './utils/utils';
const fs = require('fs');
const path = require('path');
const { sep } = path;
import { BlockConfig } from './types';

/**
 * update package
 * @param filePath 
 * @param blockJson 
 * @param intl 
 */
export default function updatePackage(
    filePath: string,
    blockJson: {
        name: string,
        version: string,
        dependencies?: {},
        devDependencies?: {}
    },
    block: BlockConfig,
    intl: { get: (key: string) => string }
) {
    const rootPath = getRootPath(filePath);
    const packagePath = `${rootPath}${sep}package.json`;

    const packageFile = fs.readFileSync(packagePath, 'utf8');
    const jsonData = packageFile ? JSON.parse(packageFile) : {};

    jsonData.dependencies = Object.assign(blockJson.dependencies || {}, jsonData.dependencies || {});
    jsonData.devDependencies = Object.assign(blockJson.devDependencies || {}, jsonData.devDependencies || {});

    if (block.type === 'npm') {
        jsonData.dependencies[blockJson.name] = blockJson.version;
    }

    const packageTpl = JSON.stringify(jsonData, undefined, '\t');

    fs.writeFile(packagePath, packageTpl, function (err: any) {
        if (err) {
            throw err;
        }
    });

    if (packageFile !== packageTpl) {
        const updateMessage: string = intl.get('packageUpdated');
        vscode.window.showInformationMessage(updateMessage);
    }
}
