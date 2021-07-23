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

    const _componentCodes =

        //     `
        // import * as React from 'react'
        // import s from './style.module.less'

        // export const Watermark: React.FC<IProps> = ({ text }) => {
        // const base64 = React.useMemo(() => {
        //     const canvas = document.createElement('canvas')
        //     const size = 180
        //     canvas.width = size
        //     canvas.height = size

        //     const ctx = canvas.getContext('2d')!
        //     ctx.font = '18px serif'
        //     ctx.fillStyle = 'rgba(51,51,51,0.15)'
        //     ctx.translate(size / 2, size / 4)
        //     ctx.rotate((-15 * Math.PI) / 180)
        //     ctx.fillText(text, (size / 2) * -1, size / 4)

        //     return canvas.toDataURL()
        // }, [text])

        // const style = {
        //     backgroundImage: ${"`url(${base64})`"},
        // }

        // return <div className={s.box} style={style}></div>
        // }

        // export default Watermark
        // `;


        //     `
        // import * as React from 'react';
        // import { useState } from 'react';
        // import 'antd/dist/antd.less';
        // import { MultiCascader } from 'c2m-biz-component';

        // const data = [
        // {
        //     value: '9987',
        //     label: '手机通讯',
        //     ifAuth: true,
        //     children: [
        //     {
        //         value: '653',
        //         label: '手机',
        //         ifAuth: true,
        //         children: [{ value: '655', label: '手机', ifAuth: true, children: [] }],
        //     },
        //     ],
        // },
        // {
        //     value: '16750',
        //     label: '个人护理',
        //     ifAuth: true,
        //     children: [
        //     {
        //         value: '16751',
        //         label: '洗发护发',
        //         ifAuth: true,
        //         children: [
        //         { value: '16761', label: '洗护套装', ifAuth: true, children: [] },
        //         { value: '16756', label: '洗发水', ifAuth: true, children: [] },
        //         ],
        //     },
        //     ],
        // },
        // {
        //     value: '1320',
        //     label: '食品饮料',
        //     ifAuth: true,
        //     children: [
        //     {
        //         value: '1583',
        //         label: '休闲食品',
        //         ifAuth: true,
        //         children: [
        //         {
        //             value: '1595',
        //             label: '饼干蛋糕',
        //             ifAuth: true,
        //             children: [
        //             { value: '17716', label: '面包', ifAuth: true, children: [] },
        //             { value: '17714', label: '中式糕点', ifAuth: true, children: [] },
        //             { value: '17713', label: '西式糕点', ifAuth: true, children: [] },
        //             { value: '17715', label: '饼干', ifAuth: true, children: [] },
        //             ],
        //         },
        //         {
        //             value: '1592',
        //             label: '肉干肉脯',
        //             ifAuth: false,
        //             children: [{ value: '17722', label: '牛肉类', ifAuth: true, children: [] }],
        //         },
        //         ],
        //     },
        //     ],
        // },
        // {
        //     value: '6196',
        //     label: '厨具',
        //     ifAuth: true,
        //     children: [
        //     {
        //         value: '6197',
        //         label: '烹饪锅具',
        //         ifAuth: true,
        //         children: [
        //         { value: '6203', label: '汤锅', ifAuth: true, children: [] },
        //         { value: '6199', label: '炒锅', ifAuth: true, children: [] },
        //         ],
        //     },
        //     ],
        // },
        // ];

        // const [value, setValue] = useState(null);

        // export default () => (
        // <MultiCascader
        //     style={{ width: 300 }}
        //     value={value}
        //     onChange={(value, items) => {
        //     console.log(value);
        //     setValue(value);
        //     }}
        //     data={data}
        //     placeholder="请选择..."
        //     okText="确定"
        //     cancelText="取消"
        //     allowClear
        // />
        // );
        // `;


        `
    import { Table } from 'antd';
    import asas from 'asasas';

    const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
    },
    ];

    const data = [];

    function sss() {};

    class App extends React.Component {
    state = {
        selectedRowKeys: [], // Check here to configure the default column
    };

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
            key: 'odd',
            text: 'Select Odd Row',
            onSelect: changableRowKeys => {
                let newSelectedRowKeys = [];
                newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                if (index % 2 !== 0) {
                    return false;
                }
                return true;
                });
                this.setState({ selectedRowKeys: newSelectedRowKeys });
            },
            },
            {
            key: 'even',
            text: 'Select Even Row',
            onSelect: changableRowKeys => {
                let newSelectedRowKeys = [];
                newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                if (index % 2 !== 0) {
                    return true;
                }
                return false;
                });
                this.setState({ selectedRowKeys: newSelectedRowKeys });
            },
            },
        ],
        };
        return <Table rowSelection={rowSelection} columns={columns} dataSource={data} onChange={this.onSelectChange}/>;
    }
    }

    ReactDOM.render(<App />, mountNode);
    `;



    let editor: any | undefined = vscode.window.activeTextEditor;
    const activeLine = editor.selection.active.line;
    // // let activeEditor: TextEditor[] = window.visibleTextEditors.filter((item: any) => {
    // //     return item.id === editor.id;
    // // });

    // // editor = activeEditor.find(item => {
    // //     return item.document.uri.scheme === 'file';
    // // });

    // // // body 中只配置 element 或 非 jsx/tsx 文件则不执行
    // // if (snippetItem.item?.body instanceof Array || !editor.document.uri.fsPath.match(/(.+\.(jsx|tsx))/g)) {
    // //     return;
    // // }

    let codes = fs.readFileSync(editor.document.uri.fsPath, 'utf8');
    let preLine = 0;

    // // 处理 vue 中 import 的插入位置
    // if (editor.document.uri.fsPath.match(/(.+\.vue)/g)) {
    //     const vueContent = codes.split('<script');
    //     preLine = vueContent[0].split('\n').length;

    //     const result = compiler.parseComponent(codes);
    //     codes = result.script.content;
    // }

    // 解析 js ts jsx tsx
    let _ast: any;
    let ast: any;
    try {
        _ast = parse(_componentCodes, {
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


    console.log(ast);


    // ast.program.body.forEachChild((item: any) => {
    //     console.log(item);
    // });

    // 模版数据解析
    const componentCodes: any = {
        import: [],
        variable: [],
        function: [],
        tsType: [],
        body: {
            variable: [],
            function: [],
            element: null,
            render: {
                variable: [],
                function: [],
            }
        }
    };

    let bodyNodePath: any;

    const elementTag = 'Table';

    /**
     * 解析组件示例代码
     * 拆解对应语句生成可用数据
     */
    traverse(_ast, {
        // 解析外部依赖
        Program(path: any) {
            const { bindings } = path.scope;

            Object.keys(bindings).forEach(key => {
                const curPath = bindings[key]?.path;
                const { type } = curPath.node;

                switch (type) {
                    case 'VariableDeclarator':
                        if (curPath.parent.type !== 'ExportNamedDeclaration' && curPath.parent.type !== 'ExportDefaultDeclaration') {
                            const { code } = generate(curPath.parent, { /* options */ }, _componentCodes);
                            componentCodes.variable.push(code);
                        }
                        break;
                    case 'TSTypeAliasDeclaration':
                        const { code } = generate(curPath.node, { /* options */ }, _componentCodes);
                        componentCodes.tsType.push(code);
                        break;
                    default:
                        if (curPath.parent.type === 'Program') {
                            let isBodyNode = false;
                            traverse(curPath.node, {
                                JSXElement(path: any) {
                                    if (path.node.openingElement.name.name === elementTag) {
                                        isBodyNode = true;
                                    }
                                }
                            }, curPath.scope);

                            if (isBodyNode) {
                                bodyNodePath = curPath;
                            } else if (type === 'FunctionDeclaration') {
                                const { code } = generate(curPath.node, { /* options */ }, _componentCodes);
                                componentCodes.function.push(code);
                            }
                        }
                        break;
                }
            });
        },
        // 解析 import
        ImportDeclaration(curPath: any) {
            const { code } = generate(curPath.node, { /* options */ }, _componentCodes);
            componentCodes.import.push(code);
        },
        // 解析 export
        ExportNamedDeclaration(curPath: any) {
            if (curPath.parent.type === 'Program') {
                let isBodyNode = false;
                traverse(curPath.node, {
                    JSXElement(path: any) {
                        if (path.node.openingElement.name.name === elementTag) {
                            isBodyNode = true;
                        }
                    }
                }, curPath.scope);

                if (isBodyNode) {
                    bodyNodePath = curPath;
                }
            }
        },
        // 解析 export default
        ExportDefaultDeclaration(curPath: any) {
            if (curPath.parent.type === 'Program') {
                let isBodyNode = false;
                traverse(curPath.node, {
                    JSXElement(path: any) {
                        if (path.node.openingElement.name.name === elementTag) {
                            isBodyNode = true;
                        }
                    }
                }, curPath.scope);

                if (isBodyNode) {
                    bodyNodePath = curPath;
                }
            }
        },
        // 解析 jsx 获取组件模版
        JSXElement(path: any) {
            if (path.node.openingElement.name.name === elementTag) {

                const { curNode }: any = getParentByType(['ReturnStatement', 'ArrowFunctionExpression'], path);
                const { code } = generate(curNode.node, { /* options */ }, _componentCodes);
                componentCodes.body.element = code;

                const { bindings } = path.scope;

                Object.keys(bindings).forEach(key => {
                    const curPath = bindings[key]?.path;
                    const { type } = curPath.node;
                    switch (type) {
                        case 'VariableDeclarator':
                            const variableCode = generate(curPath.parent, { /* options */ }, _componentCodes);
                            componentCodes.body.render.variable.push(variableCode.code);
                            break;
                        case 'FunctionDeclaration':
                            const functionCode = generate(curPath.node, { /* options */ }, _componentCodes);
                            componentCodes.body.render.function.push(functionCode.code);
                            break;
                        default:
                            break;
                    }
                });

                path.stop();
            }
        }
    });

    traverse(bodyNodePath.node, {
        // 解析 class 组件 property
        ClassProperty(path: any) {
            const { code } = generate(path.node, { /* options */ }, _componentCodes);
            componentCodes.body.variable.push(code);
        },
        // 解析 class 组件 method
        ClassMethod(path: any) {
            if (path.node.key.name !== "render") {
                const { code } = generate(path.node, { /* options */ }, _componentCodes);
                componentCodes.body.function.push(code);
            }
        },
    }, bodyNodePath.scope);

    console.log(componentCodes);

    function getParentByType(type: string | any[], path: any): any {
        if (type instanceof Array ? type.includes(path.parentPath.type) : path.parentPath.type === type) {
            return {
                parent: path.parent,
                curNode: path
            };
        } else {
            return getParentByType(type, path.parentPath);
        }
    }


    // // const {
    // //     // state: stateContent, 
    // //     property: propertyContent, method: methodContent } = snippetItem.item.body;


    // const propertyContent = [
    //     "columns = [",
    //     "  {",
    //     "    title: 'Name',",
    //     "    dataIndex: 'name',",
    //     "    sorter: true,",
    //     "    render: name => `${name.first} ${name.last}`,",
    //     "    width: '20%',",
    //     "  },",
    //     "  {",
    //     "    title: 'Gender',",
    //     "    dataIndex: 'gender',",
    //     "    filters: [",
    //     "      { text: 'Male', value: 'male' },",
    //     "      { text: 'Female', value: 'female' },",
    //     "    ],",
    //     "    width: '20%',",
    //     "  },",
    //     "  {",
    //     "    title: 'Email',",
    //     "    dataIndex: 'email',",
    //     "  },",
    //     "];"
    // ];
    // const methodContent = [
    //     "/**",
    //     " *",
    //     " * @param {*} pagination",
    //     " * @param {*} filters",
    //     " * @param {*} sorter",
    //     " */",
    //     "handleTableChange = (pagination, filters, sorter) => {",
    //     "  this.fetch({",
    //     "    sortField: sorter.field,",
    //     "    sortOrder: sorter.order,",
    //     "    pagination,",
    //     "    ...filters,",
    //     "  });",
    //     "};"
    // ];

    // const stateContent: any = {
    //     a: 1,
    //     b: 2
    // };

    // const importDeclaration: any = {
    //     antd: ['Button', 'Table'],
    //     moment: 'moment'
    // };
    const _importDeclaration: any = {};

    // const variableDeclaration: string[] = [
    //     "const aaaa = {",
    //     " data: 12121",
    //     "}",
    //     "",
    //     "const asas = () => {",
    //     "  console.log(123)",
    //     "}"
    // ];

    // const functionDeclaration: string[] = [
    //     "function ss() {",
    //     "}"
    // ];

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

    // console.log('ast', ast);

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



    // console.log('mainNode', mainNode);

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

