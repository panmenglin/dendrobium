

import * as vscode from 'vscode';
import { window, Memento } from 'vscode';
import { getNpmRootPath, actuator, getGitRootPath, pluginConfiguration } from '../utils/utils';
import getGitConfig from '../utils/getGitConfig';
import statistics from '../statistics';
import { ComponentConfig } from '../types';

const { default: traverse } = require('@babel/traverse');
import { parse } from '@babel/parser';
const compiler = require('vue-template-compiler')

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { sep } = path;

/**
 * 安装组件
 * install component
 * @param component
 * @param state
 * @param pathName
 */
export default async function componentInstall(
    component: ComponentConfig,
    // component: any,
    state: Memento,
    intl: { get: (key: string) => string },
) {

    // 获取当前正在编辑的文件
    // get active editor
    let editor: any | undefined = state.get('activeTextEditor');
    let activeEditor: vscode.TextEditor[] = window.visibleTextEditors.filter((item: any) => {
        return item.id === editor.id;
    });

    editor = activeEditor.find(item => {
        return item.document.uri.scheme === 'file';
    });

    if (!editor) {
        return;
    }

    const filePath = editor.document.uri.path;

    // 统计埋点
    // send statistics information
    const gitRootPath = getGitRootPath(filePath);
    const gitUser: any = await getGitConfig(gitRootPath, intl);

    if (gitUser && gitUser.name) {
        statistics({
            type: 'install',
            component,
            library: component.library
        });
    }

    // 组件安装
    // install
    const npmRootPath = getNpmRootPath(filePath);

    const packageJsonPath = `${npmRootPath}${sep}package.json`;
    let packageJson: any;

    if (fs.existsSync(packageJsonPath)) {
        packageJson = fs.readFileSync(packageJsonPath, 'utf-8');

        if (packageJson) {
            packageJson = JSON.parse(packageJson);

            if (packageJson.dependencies && packageJson.dependencies[component.name]) {

                const answer = await vscode.window.showInformationMessage('组件已存在，是否重新安装？', '重新安装', '跳过');

                if (answer === '重新安装') {

                } else {
                    insertImportDeclaration(editor, component.importName, component.name);
                    return;
                }
            }
        }
    }

    if (npmRootPath) {

        const cmdActuator = new actuator({
            cwd: npmRootPath,
        }, (error: any) => {
            window.showErrorMessage(`${chalk.red('🚧 安装失败')}： ${error}`);
        });

        const packageToolCommand: { [key: string]: string } | undefined = pluginConfiguration(state).get('dendrobium.packageManagementTool');

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: intl.get('loadingInstall'),
        }, (progress, token) => {

            const installCommand = component.installMethod?.package || (packageToolCommand?.default || 'npm install --save');

            const res = cmdActuator.run(`${installCommand} ${component.name}`).then(() => {
                window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);
                window.showInformationMessage(intl.get('successImport'));

                // 更新依赖
                insertImportDeclaration(editor, component.importName, component.name);
            });

            return res;
        });
        // }
    } else {
        window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);
        window.showInformationMessage(intl.get('successImport'));
    }
}

/**
 * 代码中插入依赖
 * @param editor
 * @param specifiers
 * @param source
 */
function insertImportDeclaration(editor: any, specifiers: string | string[], source: string) {

    let codes = fs.readFileSync(editor.document.uri.fsPath, 'utf8');
    let preLine = 0;

    // 处理 vue 中 import 的插入位置
    if (editor.document.uri.fsPath.match(/(.+\.vue)/g)) {
        const vueContent = codes.split('<script');
        preLine = vueContent[0].split('\n').length;

        const result = compiler.parseComponent(codes);
        codes = result.script.content;
    }


    // 解析 js ts jsx tsx
    const ast = parse(codes, {
        sourceType: "module",
        plugins: [
            "typescript",
            "classProperties",
            "objectRestSpread",
            "jsx",
            "decorators-legacy"
        ],
    });

    console.log(ast);

    // let lastImportPath: any;
    let lastImportNode: any;
    traverse(ast, {
        /**
         * 更新 import
         * @param path
         */
        ImportDeclaration(path: any) {
            // lastImportPath = path;
            const curNode = path.node;

            if (path.node.source.value === source) {

                if (specifiers instanceof Array) {
                    const _specifiers = [...specifiers];

                    curNode.specifiers?.map((item: any) => {
                        const importedName = item.imported?.name;

                        if (!_specifiers.includes(importedName)) {
                            _specifiers.push(importedName);
                        }
                    });

                    const start = new vscode.Position(preLine + curNode.loc.start.line - 1, curNode.loc.start.column);
                    const end = new vscode.Position(preLine + curNode.loc.end.line - 1, curNode.loc.end.column);

                    const selection = new vscode.Range(start, end);

                    const code = `import { ${_specifiers.sort().join(', ')} } from '${source}';`;

                    editor.edit((builder: any) => {
                        builder.replace(selection, code);
                    });
                }

                lastImportNode = 0;
                path.stop;
            } else {
                lastImportNode = path.node;
            }
        }
    });

    if (lastImportNode) {
        // 在最后一个 import 后插入
        const { line } = lastImportNode.loc.end;
        const position = new vscode.Position((preLine - 1) + line, 0);

        const code = specifiers ?
            specifiers instanceof Array ? `import { ${specifiers.join(', ')} } from '${source}';\n` : `import ${specifiers} from '${source}';\n`
            : `import '${source}';\n`;

        editor.edit((builder: any) => {
            builder.insert(position, code);
        });
    } else if (lastImportNode !== 0) {
        // 在第一行插入
        const position = new vscode.Position(preLine + 0, 0);

        const code = specifiers ?
            specifiers instanceof Array ? `import { ${specifiers.join(', ')} } from '${source}';\n` : `import ${specifiers} from '${source}';\n`
            : `import '${source}';\n`;

        editor.edit((builder: any) => {
            builder.insert(position, code);
        });
    }
}
