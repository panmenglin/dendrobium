import { TreeItem, TreeDataProvider, workspace, ThemeIcon, Event, EventEmitter, Memento, window } from 'vscode';
import { LibrarysConfig } from './types';
import { getLibrary } from './service';
import { pluginConfiguration } from './utils/utils';

const chalk = require('chalk');
const fs = require('fs');
export class TreeItemNode extends TreeItem {

    constructor(
        public readonly item: any,
    ) {
        super(item);
    }

    // id = this.item.code;

    label = this.item.name;

    collapsibleState = this.item.collapsed;

    description = this.item.description;

    iconPath = this.item.icon;

    contextValue = this.item.type;

    tooltip = this.item?.body?.join('\n') || '';
}

export class TreeViewProvider implements TreeDataProvider<TreeItemNode>{

    constructor(
        public readonly state: Memento,
    ) {
    }

    private _onDidChangeTreeData: EventEmitter<TreeItemNode | undefined | void> = new EventEmitter<TreeItemNode | undefined | void>();
    readonly onDidChangeTreeData: Event<TreeItemNode | undefined | void> = this._onDidChangeTreeData.event;

    // 刷新 tree-vidw
    // tree-view refresh
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    // 获取树视图中的每一项 item,所以要返回 element
    getTreeItem(element: TreeItemNode): TreeItem | Thenable<TreeItem> {
        return element;
    }

    // 获取 chidren 返回 TreeItemNode
    getChildren(element?: TreeItemNode | undefined): import("vscode").ProviderResult<TreeItemNode[]> {
        return Promise.resolve(this.getComponents(element));
    }

    /**
     * 查询组件列表
     * fetch components list
     */
    async getComponents(element: TreeItemNode | undefined, path?: string) {

        const librarysConfig: LibrarysConfig | undefined = pluginConfiguration(this.state).get('dendrobium.librarysConfig');

        if (!librarysConfig) {
            return;
        }

        const library = await getLibrary({
            librarysConfig
        });

        if (!element) {
            const root = [{
                name: '文档',
                code: 'docs',
                level: 0,
                collapsed: true,
            }, {
                name: '代码片段',
                code: 'snippets',
                level: 0,
                collapsed: true,
            }];

            return root.map(item => {
                return new TreeItemNode(item);
            });

        }

        if (element.item.level === 0) {
            return library.library.map((item: any) => {

                // TODO 根据本地目录是否有该组件判断是否显示
                // const snippetsRootPath = `${item.uri.path}/.vscode/dendrobiu.snippets.json`;
                // const docsRootPath = `${item.uri.path}/.vscode/${element.command.code}.component-docs`;
                // if (fs.existsSync(snippetsRootPath) || fs.existsSync(docsRootPath)) {
                return new TreeItemNode({
                    ...item,
                    collapsed: true,
                    treeType: element.item.code,
                    icon: new ThemeIcon('library')
                });
                // }
            });
        } else {
            // 代码片段
            if (element.item.treeType === 'snippets') {
                const snippets: any[] = [];
                workspace.workspaceFolders?.map(item => {
                    // const rootPath = `${item.uri.path}/.vscode/${element.item.code}.code-snippets`;
                    const rootPath = `${item.uri.path}/.vscode/dendrobium.snippets.json`;

                    let currentSnippets: { [key: string]: any } = {};
                    if (fs.existsSync(rootPath)) {
                        const _currentSnippets = fs.readFileSync(rootPath, 'utf-8');

                        if (_currentSnippets) {
                            try {
                                currentSnippets = JSON.parse(_currentSnippets);
                            } catch (error) {
                                window.showErrorMessage(chalk.red(`.vscode/dendrobium.snippets.json 语法错误，请检查配置文件是否正确 json 格式`));
                                return;
                            }
                        }
                    }

                    const library = currentSnippets[element.item.code]?.children;

                    if (library) {
                        Object.keys(library).forEach(key => {
                            library[key].name = key;
                            snippets.push(library[key]);
                        });
                    }
                });

                return snippets.map((item: any) => new TreeItemNode({
                    ...item,
                    type: 'snippets',
                    icon: new ThemeIcon('code')
                }));
            }
            // 文档
            else if (element.item.treeType === 'docs') {
                const docs: any[] = [];
                workspace.workspaceFolders?.map(item => {
                    const rootPath = `${item.uri.path}/.vscode/${element.item.code}.component-docs`;

                    let currentDocs: { [key: string]: any } = {};
                    if (fs.existsSync(rootPath)) {
                        const _currentDocs = fs.readFileSync(rootPath, 'utf-8');

                        if (_currentDocs) {
                            currentDocs = JSON.parse(_currentDocs);
                        }
                    }

                    Object.keys(currentDocs).forEach(key => {
                        docs.push(currentDocs[key]);
                    });
                });

                return docs.map((item: any) => new TreeItemNode({
                    ...item,
                    name: item.title,
                    type: 'docs',
                    icon: new ThemeIcon('book')
                }));
            }
        }
    }
}