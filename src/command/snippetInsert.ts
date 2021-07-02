/**
 * 插入代码片段
 */
import * as vscode from 'vscode';
import { Memento, ExtensionContext, window, Position, SnippetString, TextEditor } from 'vscode';
import statistics from '../statistics';
const chalk = require('chalk');

const fs = require('fs');
import { parse } from '@babel/parser';
const compiler = require('vue-template-compiler');
const { default: traverse } = require('@babel/traverse');

export async function snippetInsert(
    context: ExtensionContext,
    state: Memento,
    snippetItem: any,
    intl: { get: (key: string) => string }
) {

    let editor: any | undefined = state.get('activeTextEditor');
    let activeEditor: TextEditor[] = window.visibleTextEditors.filter((item: any) => {
        return item.id === editor.id;
    });

    editor = activeEditor.find(item => {
        return item.document.uri.scheme === 'file';
    });

    const selection = editor ? editor.selection : undefined;

    if (!selection) {
        return;
    }

    const insertPosition = new Position(selection.active.line, selection.active.character);
    const content = snippetItem.item.body?.element?.join('\n') || snippetItem.item.body?.join('\n');

    await editor.insertSnippet(new SnippetString(content), insertPosition);

    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);

    // 代码片段插入埋点
    statistics({
        type: 'snippetInsert',
        component: {
            code: snippetItem.item.componentCode,
            name: '',
            importName: ''
        },
        library: {
            code: snippetItem.item.libraryCode,
        }
    });

    functionInsert(context, state, snippetItem, intl);
}

/**
 * 插入关联方法
 * @param context
 * @param state
 * @param snippetItem
 * @param intl
 * @returns
 */
export async function functionInsert(
    context: ExtensionContext,
    state: Memento,
    snippetItem: any,
    intl: { get: (key: string) => string }
) {

    let editor: any | undefined = state.get('activeTextEditor');
    let activeEditor: TextEditor[] = window.visibleTextEditors.filter((item: any) => {
        return item.id === editor.id;
    });

    editor = activeEditor.find(item => {
        return item.document.uri.scheme === 'file';
    });

    // body 中只配置 element 或 非 jsx/tsx 文件则不执行
    if (snippetItem.item?.body instanceof Array || !editor.document.uri.fsPath.match(/(.+\.(jsx|tsx))/g)) {
        return;
    }

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
    let ast;
    try {
        ast = parse(codes, {
            sourceType: "module",
            plugins: [
                "typescript",
                "classProperties",
                "objectRestSpread",
                "jsx",
                "decorators-legacy"
            ],
            errorRecovery: true
        });
    } catch (error) {
        console.log(error);
        window.showErrorMessage(chalk.red(`当前页面存在语法错误，请修改后重试。      \n\n ${error}`));
        return;
    }


    traverse(ast, {
        /**
         * 更新 import
         * @param path
         */
        ClassDeclaration(path: any) {
            const curNode = path.node;

            console.log(curNode);

            const classBody = curNode.body?.body;

            if (!classBody) {
                return;
            }

            const preItem = classBody.find((item: any) => item.key?.name === 'render') || classBody[classBody.length - 1];

            if (!preItem) {
                return;
            }

            const { column } = preItem.loc.start;
            console.log(column);

            const { tabSize } = editor.options;

            console.log(tabSize);

            // react


            // state
            // console.log()

            let content = '';

            // property
            const property = snippetItem.item.body.property.map((item: any) => {
                const indentation = item.match(/^\s+/);
                let editorIndentation = '';

                if (indentation) {
                    editorIndentation = indentation[0].replace(/(\s{2})/g, new Array(tabSize + 1).join(' '));

                    if (item) {
                        item = item.replace(/^\s+/, editorIndentation);
                    }
                }

                return new Array(column + 1).join(' ') + item;
            });

            const propertyContent = property.join('\n');

            if (propertyContent) {
                content = content + propertyContent;
            }


            // method
            const method = snippetItem.item.body.method.map((item: any) => {
                const indentation = item.match(/^\s+/);
                let editorIndentation = '';

                if (indentation) {
                    editorIndentation = indentation[0].replace(/(\s{2})/g, new Array(tabSize + 1).join(' '));

                    if (item) {
                        item = item.replace(/^\s+/, editorIndentation);
                    }
                }

                return new Array(column + 1).join(' ') + item;
            });

            const methodContent = method.join('\n');

            if (methodContent) {

                if (propertyContent) {
                    content = content + '\n\n';
                }

                content = content + methodContent;
            }

            if (content) {
                content = '\n' + content + '\n';
            } else {
                return;
            }

            const line = preItem.loc.start.line - 2;

            const position = new vscode.Position(line + preLine, column);

            editor.insertSnippet(new SnippetString(content), position);
        }
    });
}
