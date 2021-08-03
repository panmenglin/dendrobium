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

import { codeReplace, codeInsert, codeInsertBefore } from '../utils/codeInsert';


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

    let editor: any | undefined = vscode.window.activeTextEditor;
    editor.document.save();

    await new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 50);
    });

    const activeLine = editor.selection.active.line;

    let codes = fs.readFileSync(editor.document.uri.fsPath, 'utf8');
    let preLine = 0;


    // 解析 js ts jsx tsx
    let _ast: any;
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

    // console.log(ast);

    // 模版数据解析
    const componentCodes: any = snippetItem.item.snippets;

    const _importDeclaration: any = {};

    /**
     * React
     * 判断组件标签插入位置是类组件还是函数组件
     * 确定主节点
     */

    let mainNode: any;
    let lastImportNode: any;
    let lastVariableNode: any;
    let lastFunctionNode: any;
    let lastTSTypeNode: any;

    ast.program?.body.map((item: any) => {
        if (item.type === "VariableDeclaration") {
            lastVariableNode = item;
        } else if (item.type === "FunctionDeclaration") {
            lastFunctionNode = item;
        } else if (item.type === "TSTypeAliasDeclaration") {
            lastTSTypeNode = item;
        }
    });

    const importDeclaration: any = {};

    try {
        traverse(ast, {
            /**
             * 对比编辑器代码 和 组件代码的 import
             */
            ImportDeclaration(path: any) {
                const curNode = path.node;
                lastImportNode = curNode;
                _importDeclaration[curNode.source.value] = true;


                const importAst = parse(componentCodes.import.join('\n'), {
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

                importAst.program.body.map((item: any) => {
                    if (item.specifiers[0].imported) {
                        importDeclaration[item.source.value] = item.specifiers.map((specifier: any) =>
                            specifier.imported.name
                        );
                    } else {
                        importDeclaration[item.source.value] = item.specifiers[0].local.name;
                    }
                });

                Object.keys(importDeclaration).forEach(key => {
                    // import 已引入
                    // 更新 import 或 跳过
                    if (importDeclaration[curNode.source.value]) {
                        if (importDeclaration[curNode.source.value] instanceof Array) {
                            const _specifiers = [...importDeclaration[curNode.source.value]];

                            curNode.specifiers?.map((item: any) => {
                                const importedName = item.imported?.name;

                                if (!_specifiers.includes(importedName)) {
                                    _specifiers.push(importedName);
                                }
                            });

                            const start = new vscode.Position(preLine + curNode.loc.start.line - 1, curNode.loc.start.column);
                            const end = new vscode.Position(preLine + curNode.loc.end.line - 1, curNode.loc.end.column);

                            const selection = new vscode.Range(start, end);

                            const code = `import { ${_specifiers.sort().join(', ')} } from '${curNode.source.value}';`;

                            editor.edit((builder: any) => {
                                builder.replace(selection, code);
                            });
                        }

                        path.skip();
                    }
                });
            },
            ClassDeclaration(path: any) {
                const curNode = path.node;

                if (curNode.loc.start.line < activeLine && curNode.loc.end.line > activeLine) {
                    mainNode = curNode;
                }
            },
            ExportNamedDeclaration(path: any) {
                const curNode = path.node;

                if (curNode.loc.start.line < activeLine && curNode.loc.end.line > activeLine) {
                    mainNode = curNode;
                }
            },
            ExportDefaultDeclaration(path: any) {
                const curNode = path.node;

                if (curNode.loc.start.line < activeLine && curNode.loc.end.line > activeLine) {
                    mainNode = curNode;
                }
            }
        });
    } catch (error) {
        console.log(error);
        window.showErrorMessage(chalk.red(`当前页面存在语法错误，请修改后重试。      \n\n ${error}`));
        return;
    }

    if (!mainNode) {
        return;
    }

    /**
     * 操作主节点外部内容
     */


    // 写入未引用的 import
    const unImport: any = {};

    Object.keys(importDeclaration).forEach(key => {
        if (!_importDeclaration[key]) {
            unImport[key] = importDeclaration[key];
        }
    });

    if (Object.keys(unImport).length > 0) {
        const importCodes: string[] = [];

        Object.keys(unImport).forEach(key => {
            const specifiers = unImport[key];
            importCodes.push(`import ${specifiers instanceof Array ? `{ ${specifiers.join(',')} }` : specifiers} from '${key}';`);
        });

        if (lastImportNode) {
            codeInsert(importCodes.join('\n'), lastImportNode, editor);
        } else {
            codeInsert(importCodes.join('\n'), mainNode, editor);
        }
    }


    // 写入变量
    if (componentCodes.variable) {
        if (lastVariableNode) {
            codeInsert(componentCodes.variable, lastVariableNode, editor);
        } else {
            codeInsertBefore(componentCodes.variable, mainNode, editor, {
                format: {
                    column: 0
                }
            });
        }
    }

    // 写入 Function
    if (componentCodes.function) {
        if (lastFunctionNode) {
            codeInsert(componentCodes.function, lastFunctionNode, editor);
        } else {
            codeInsertBefore(componentCodes.function, mainNode, editor, {
                format: {
                    column: 0
                }
            });
        }
    }

    // 写入 TS Type
    if (componentCodes.tsType) {
        if (lastTSTypeNode) {
            codeInsert(componentCodes.tsType, lastTSTypeNode, editor);
        } else {
            codeInsertBefore(componentCodes.tsType, mainNode, editor, {
                format: {
                    column: 0
                }
            });
        }
    }


    /**
     * 操作主节点
     */

    let stateInserted = false;

    /**
     * 解析主节点
     */

    // React Class 组件 property
    if (mainNode.type === 'ClassDeclaration') {
        const classBody = mainNode.body.body;

        // mainNode.body?.body.map((item: any) => {
        // // React Class 组件有 constructor
        // if (item.type === 'ClassMethod' && item.kind === 'constructor' && !stateInserted && stateContent) {
        //     item.body.body.map((expressionItem: any) => {
        //         if (expressionItem.expression.type === 'AssignmentExpression' && expressionItem.expression.left.property.name === 'state') {

        //             Object.keys(stateContent).forEach(key => {
        //                 expressionItem.expression.right.properties.push(t.objectProperty(t.identifier(key), t.numericLiteral(stateContent[key])));
        //             });

        //             stateInserted = true;

        //             const { code } = generate(expressionItem, { /* options */ }, codes);

        //             codeReplace(code, expressionItem, editor);
        //         }
        //     });
        // }

        // // React Class 组件 property 有 state
        // if (item.type === 'ClassProperty' && item.key.name === 'state' && !stateInserted && stateContent) {
        //     Object.keys(stateContent).forEach(key => {
        //         item.expression.right.properties.push(t.objectProperty(t.identifier(key), t.numericLiteral(stateContent[key])));
        //     });

        //     stateInserted = true;

        //     const { code } = generate(item, { /* options */ }, codes);

        //     codeReplace(code, item, editor);
        // }
        // });

        // // React Class 组件无 constructor 无 property state
        // if (!stateInserted && stateContent) {
        //     classBody.unshift(t.classProperty(t.identifier('state'), t.objectExpression([t.objectProperty(t.identifier('asas'), t.numericLiteral(2121))])));

        //     const { code } = generate(classBody[0], { /* options */ }, codes);

        //     if (classBody.length > 0) {
        //         codeInsertBefore(code, classBody[classBody.length - 1], editor);
        //     }
        // }

        // 插入 property
        if (componentCodes.body.variable) {
            if (classBody.length > 0) {
                codeInsertBefore(componentCodes.body.variable, classBody[classBody.length - 1], editor);
            }
        }

        // 插入 method
        if (componentCodes.body.function) {
            if (classBody.length > 0) {
                codeInsertBefore(componentCodes.body.function, classBody[classBody.length - 1], editor);
            }
        }

        const { body: { body: renderBody } } = classBody.find((item: any) => item.key.name === 'render');

        // 插入 variable
        if (componentCodes.body.render.variable) {
            if (classBody.length > 0) {
                codeInsertBefore(componentCodes.body.render.variable, renderBody[renderBody.length - 1], editor);
            }
        }

        // 插入 function
        if (componentCodes.body.render.function) {
            if (classBody.length > 0) {
                codeInsertBefore(componentCodes.body.render.function, renderBody[renderBody.length - 1], editor);
            }
        }
    }


    // React Function 组件
    else if (mainNode.type === 'ExportNamedDeclaration' || mainNode.type === 'ExportDefaultDeclaration') {

        // 插入 useState
        let lastUseState: any;
        let parentNode: any;

        traverse(ast, {
            Identifier(path: any) {
                const curNode = path.node;
                if (curNode.name === "useState") {
                    lastUseState = curNode;
                    path.skip();
                }
            }
        });

        traverse(ast, {
            // VariableDeclaration(path: any) {
            //     const curNode = path.node;
            //     if (lastUseState && curNode.loc.start.line === lastUseState.loc.start.line) {
            //         lastUseState = curNode;
            //         path.skip();
            //     }
            // },
            BlockStatement(path: any) {
                const curNode = path.node;
                if (!parentNode) {
                    parentNode = curNode;
                }
            }
        });

        // if (stateContent) {
        //     if (lastUseState) {
        //         const codes: any = [];

        //         Object.keys(stateContent).forEach(key => {
        //             codes.push(`const [${key}, set${key}] = React.useState(${stateContent[key]})`);
        //         });

        //         codeInsert(codes, lastUseState, editor);
        //     } else {
        //         const codes: any = [];

        //         Object.keys(stateContent).forEach(key => {
        //             codes.push(`const [${key}, set${key}] = React.useState(${stateContent[key]})`);
        //         });

        //         codeInsertBefore(codes, parentNode.body[0], editor);
        //     }
        // }

        if (parentNode) {
            const returnNode = parentNode.body.find((item: any) => item.type === 'ReturnStatement');

            // 插入 property
            if (componentCodes.body.render.variable) {
                if (returnNode) {
                    codeInsertBefore(componentCodes.body.render.variable, returnNode, editor);
                }
            }

            // 插入 method
            if (componentCodes.body.render.funtion) {
                if (returnNode) {
                    codeInsertBefore(componentCodes.body.render.funtion, returnNode, editor);
                }
            }
        }
    }


    // React Function 组件

}

