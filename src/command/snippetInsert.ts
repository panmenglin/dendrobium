/**
 * 插入代码片段
 */
import * as vscode from 'vscode';
import { Memento, ExtensionContext, window, Position, SnippetString, TextEditor } from 'vscode';

import statistics from '../statistics';

const chalk = require('chalk');
const fs = require('fs');
const compiler = require('vue-template-compiler');

import { parse } from '@babel/parser';
const { default: traverse } = require('@babel/traverse');
const t = require('@babel/types');
const { default: generate } = require('@babel/generator');

import { codeReplace, codeInsert } from '../utils/codeInsert';


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
    let ast: any;
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

    const { state: stateContent, property: propertyContent, method: methodContent } = snippetItem.item.body;

    // React state property method
    const stateAst = stateContent ? parse(stateContent.join('\n'), { errorRecovery: true }) : null;
    // const propertyAst = propertyContent ? parse(propertyContent.join('\n'), { errorRecovery: true }) : null;
    // const methodAst = methodContent ? parse(methodContent.join('\n'), { errorRecovery: true }) : null;

    // state property
    const stateProperty: any[] = [];
    let stateInserted = false;

    // 获取代码片段关联的 state
    traverse(stateAst, {
        ObjectProperty(path: any) {
            stateProperty.push(path.node);
        }
    });

    // React Class 组件有 constructor
    traverse(ast, {
        ClassMethod(path: any) {
            const curNode = path.node;
            if (curNode.kind === 'constructor' && !stateInserted && stateProperty.length > 0) {
                curNode.body.body.map((expressionItem: any) => {
                    if (expressionItem.expression.type === 'AssignmentExpression' && expressionItem.expression.left.property.name === 'state') {

                        stateProperty.map(item => {
                            expressionItem.expression.right.properties.push(item);
                        });

                        stateInserted = true;

                        const { code } = generate(expressionItem, { /* options */ }, codes);

                        codeReplace(code, expressionItem, editor);
                    }
                });
            }
        },
    });

    // React Class 组件 property 有 state
    traverse(ast, {
        ClassProperty(path: any) {
            const curNode = path.node;
            if (curNode.key.name === 'state' && !stateInserted && stateProperty.length > 0) {

                stateProperty.map(item => {
                    curNode.value.properties.push(item);
                });

                stateInserted = true;

                const { code } = generate(curNode, { /* options */ }, codes);

                codeReplace(code, curNode, editor);
            }
        },
    });


    // React Class 组件 property
    traverse(ast, {
        /**
         * 更新 import
         * @param path
         */
        ClassBody(path: any) {

            const curNode = path.node;

            if (!stateInserted && stateProperty.length > 0) {
                curNode.body.unshift(t.classProperty(t.identifier('state'), t.objectExpression(stateProperty)));

                const { code } = generate(curNode.body[0], { /* options */ }, codes);

                if (curNode.body.length > 0) {
                    codeInsert(code, curNode.body[curNode.body.length - 1], editor);
                }
            }

            if (propertyContent) {
                // const { code } = generate(propertyAst.program, { /* options */ }, codes);

                if (curNode.body.length > 0) {
                    codeInsert(propertyContent, curNode.body[curNode.body.length - 1], editor);
                }
            }

            if (methodContent) {
                // const { code } = generate(methodAst.program, { /* options */ }, codes);

                if (curNode.body.length > 0) {
                    codeInsert(methodContent, curNode.body[curNode.body.length - 1], editor);
                }
            }
        }
    });
}
