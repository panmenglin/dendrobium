/**
 * 插入代码片段
 */
import { Memento, ExtensionContext, window, Position, SnippetString, TextEditor } from 'vscode';
import statistics from '../statistics';
const chalk = require('chalk');

export default async function snippetInsert(
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
    const content = snippetItem.item.body.join('\n');

    await editor.insertSnippet(new SnippetString(content), insertPosition);

    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);


    // 代码片段插入埋点
    statistics({
        type: 'snippetInsert',
        component: {
            code: snippetItem.item.componentCode,
        },
        library: {
            code: snippetItem.item.libraryCode,
        }
    });
}
