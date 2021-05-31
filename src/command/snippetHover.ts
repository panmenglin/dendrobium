/**
 * 编辑器悬浮显示文档地址
 * hover provider display doc info
 */
import { workspace, Hover } from 'vscode';
import { getVSCodeRootPath } from '../utils/utils';

const fs = require('fs');

export default function provideHover(document: any, position: any, token: any) {
    const fileName = document.fileName;
    const word = document.getText(document.getWordRangeAtPosition(position));

    const fileContent = document.getText();

    const modules: string[] = fileContent.match(/import\s(.+?)\sfrom\s('|")(.+?)('|")(;|\n|\r|\r\n)/g);

    const modulesMap: { [key: string]: string[] } = {};

    let docs: { [key: string]: any } = {};

    modules.map(item => {
        const res: string[] | null = item.match(/import\s(.+?)\sfrom\s('|")(.+?)('|")(;|\n|\r|\r\n)/);

        if (res?.length) {
            modulesMap[res[3]] = res[1].split(" ");

            const curWorkSpacePath = workspace.workspaceFolders?.length === 1 ? workspace.workspaceFolders[0].uri.path : getVSCodeRootPath(fileName);

            const rootPath = `${curWorkSpacePath}/.vscode/${res[3]}.component-docs`;

            let currentDocs: { [key: string]: any } = {};
            if (fs.existsSync(rootPath)) {
                const _currentDocs = fs.readFileSync(rootPath, 'utf-8');

                if (_currentDocs) {
                    currentDocs = JSON.parse(_currentDocs);
                }
            }

            Object.keys(currentDocs).forEach(key => {

                if (currentDocs[key].name instanceof Array) {
                    currentDocs[key].name.map((name: string) => {
                        docs[name] = currentDocs[key];
                    });
                } else {
                    docs[currentDocs[key].name] = currentDocs[key];
                }
            });
        }
    });

    if (docs[word]) {
        return new Hover(`${docs[word].title} 文档：${docs[word].url}`);
    }
}