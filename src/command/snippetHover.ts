/**
 * 编辑器悬浮显示文档地址
 * hover provider display doc info
 */
import { workspace, Hover } from 'vscode';
import { getVSCodeRootPath } from '../utils/utils';
import { getDoc } from '../service';

const fs = require('fs');

export default async function provideHover(document: any, position: any, token: any) {
    const fileName = document.fileName;

    const word = document.getText(document.getWordRangeAtPosition(position, /[^\>\<\/\s]+/));

    const fileContent = document.getText();

    const modules: string[] = fileContent.match(/import\s(.+?)\sfrom\s('|")(.+?)('|")(;|\n|\r|\r\n)/g);

    const modulesMap: { [key: string]: string[] } = {};

    let docs: { [key: string]: any } = {};

    // 有引入的形式
    modules?.map(item => {
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
                if (currentDocs[key].importName instanceof Array) {
                    currentDocs[key].importName.map((name: string) => {
                        docs[name] = currentDocs[key];
                    });
                } else {
                    docs[currentDocs[key].importName] = currentDocs[key];
                }
            });
        }
    });

    // 无引入的形式
    if (!docs[word]) {
        const curWorkSpacePath = workspace.workspaceFolders?.length === 1 ? workspace.workspaceFolders[0].uri.path : getVSCodeRootPath(fileName);
        const rootPath = `${curWorkSpacePath}/.vscode/other.component-docs`;

        let currentDocs: { [key: string]: any } = {};
        if (fs.existsSync(rootPath)) {
            const _currentDocs = fs.readFileSync(rootPath, 'utf-8');

            if (_currentDocs) {
                currentDocs = JSON.parse(_currentDocs);
            }
        }

        Object.keys(currentDocs).forEach(key => {
            docs[currentDocs[key].elementTag] = currentDocs[key];
        });
    }

    if (docs[word]) {
        let mdDoc;
        if (docs[word].docFile) {
            mdDoc = await getDoc({
                path: docs[word].docFile
            });
            // 识别 markdown 文档中 API 部分，暂时固定格式
            mdDoc = mdDoc.match(/## API([\s\S]*?)(\n\#{2}\s)/) || mdDoc.match(/## API([\s\S]*)/);
        }

        return new Hover(`${docs[word].title} 文档：${docs[word].url}
        ${mdDoc ? mdDoc[1] : ''}`);
    }
}