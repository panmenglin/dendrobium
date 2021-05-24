import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, Uri, window, workspace, ThemeIcon, Event, EventEmitter, commands } from 'vscode';
import { getLibrary } from './service';

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

    readonly onDidChangeTreeData?: Event<TreeItemNode | null | undefined> | undefined;
    private _onDidChangeTreeData: EventEmitter<TreeItemNode | undefined | void> = new EventEmitter<TreeItemNode | undefined | void>();

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
        const library = await getLibrary();

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
                // const snippetsRootPath = `${item.uri.path}/.vscode/${element.command.code}.code-snippets`;
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
                    const rootPath = `${item.uri.path}/.vscode/${element.item.code}.code-snippets`;

                    let currentSnippets: { [key: string]: any } = {};
                    if (fs.existsSync(rootPath)) {
                        const _currentSnippets = fs.readFileSync(rootPath, 'utf-8');

                        if (_currentSnippets) {
                            currentSnippets = JSON.parse(_currentSnippets);
                        }
                    }

                    Object.keys(currentSnippets).forEach(key => {
                        currentSnippets[key].name = key;
                        snippets.push(currentSnippets[key]);
                    });
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
                    type: 'docs',
                    icon: new ThemeIcon('book')
                }));
            }
        }



    }

    // 这个静态方法时自己写的，你要写到 extension.ts 也可以
    // public static async initTreeViewItem() {

    //     // 实例化 TreeViewProvider
    //     const treeViewProvider = new TreeViewProvider();

    //     // registerTreeDataProvider：注册树视图
    //     // 你可以类比 registerCommand(上面注册 Hello World)
    //     window.registerTreeDataProvider('components-view', treeViewProvider);
    //     commands.registerCommand('dendrobium.treeViewRefresh', () => {
    //         treeViewProvider.refresh();
    //     });
    // }
}