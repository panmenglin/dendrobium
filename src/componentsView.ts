import { TreeItem, TreeItemCollapsibleState, TreeDataProvider, Uri, window, workspace } from 'vscode';
import { join } from 'path';
import { getLibrary } from './service';

const fs = require('fs');

// 创建每一项 label 对应的图片名称
// 其实就是一个Map集合，用 ts 的写法
// const ITEM_ICON_MAP = new Map<string, string>([
//     ['pig1', 'pig1.svg'],
//     ['pig2', 'pig2.svg'],
//     ['pig3', 'pig3.svg']
// ]);

// 第一步：创建单项的节点(item)的类
export class TreeItemNode extends TreeItem {

    constructor(
        // readonly 只可读
        public readonly item: any,
        // public readonly collapsibleState: TreeItemCollapsibleState,
        // private readonly version: string,
        // public readonly command?: vscode.Command
    ) {
        super(item);
        console.log(item);
    }

    label = this.item.name;

    collapsibleState = this.item.collapsed;

    description = this.item.description;

    // command: 为每项添加点击事件的命令
    command = {
        title: this.item.name,          // 标题
        code: this.item.code,
        command: 'itemClick',       // 命令 ID
        tooltip: this.item.name,        // 鼠标覆盖时的小小提示框
        arguments: [                // 向 registerCommand 传递的参数。
            this.item.name,             // 目前这里我们只传递一个 label
        ]
    };

    // iconPath： 为该项的图标因为我们是通过上面的 Map 获取的，所以我额外写了一个方法，放在下面
    // iconPath = '../dendrobium.png';
    // TreeItemNode.getIconUriForLabel(this.label);

    // description = '1212121212';

    // tooltip = '121212';

    // __filename：当前文件的路径
    // 重点讲解 Uri.file(join(__filename,'..', '..') 算是一种固定写法
    // Uri.file(join(__filename,'..','assert', ITEM_ICON_MAP.get(label)+''));   写成这样图标出不来
    // 所以小伙伴们就以下面这种写法编写
    // static getIconUriForLabel(label: string): Uri {
    //     return Uri.file(join(__filename, '..', '..', 'src', 'assert', ITEM_ICON_MAP.get(label) + ''));
    // }
}

export class TreeViewProvider implements TreeDataProvider<TreeItemNode>{
    // 自动弹出的可以暂不理会
    onDidChangeTreeData?: import("vscode").Event<TreeItemNode | null | undefined> | undefined;

    // 自动弹出
    // 获取树视图中的每一项 item,所以要返回 element
    getTreeItem(element: TreeItemNode): TreeItem | Thenable<TreeItem> {
        return element;
    }

    // 自动弹出，但是我们要对内容做修改
    // 给每一项都创建一个 TreeItemNode
    getChildren(element?: TreeItemNode | undefined): import("vscode").ProviderResult<TreeItemNode[]> {
        return Promise.resolve(this.getComponents(element));
    }

    /**
     * 查询组件列表
     */
    async getComponents(element: TreeItemNode | undefined, path?: string) {
        const library = await getLibrary();

        console.log(element);

        if (!element) {
            return library.library.map((item: any) => {
                console.log(item);

                item.collapsed = TreeItemCollapsibleState.Collapsed as TreeItemCollapsibleState;

                return new TreeItemNode(
                    item,
                );
            });
        }


        const snippet: any[] = [];
        workspace.workspaceFolders?.map(item => {
            const rootPath = `${item.uri.path}/.vscode/${element.command.code}.code-snippets`;

            let currentSnippet: { [key: string]: any } = {};
            if (fs.existsSync(rootPath)) {
                const _currentSnippet = fs.readFileSync(rootPath, 'utf-8');

                if (_currentSnippet) {
                    currentSnippet = JSON.parse(_currentSnippet);
                }
            }

            Object.keys(currentSnippet).forEach(key => {
                currentSnippet[key].name = key;
                snippet.push(currentSnippet[key]);
            });

            console.log(snippet);
            console.log(rootPath);
        });

        return snippet.map((item: any) => new TreeItemNode(
            item,
        ));
    }

    // 这个静态方法时自己写的，你要写到 extension.ts 也可以
    public static async initTreeViewItem() {

        // 实例化 TreeViewProvider
        const treeViewProvider = new TreeViewProvider();

        // registerTreeDataProvider：注册树视图
        // 你可以类比 registerCommand(上面注册 Hello World)
        window.registerTreeDataProvider('treeView-item', treeViewProvider);
    }
}