import { Position, Range, SnippetString } from 'vscode';

function codeFormat(code: any, astNode: any, editor: any) {
    const codeArray = code instanceof Array ? code : code.split('\n');
    const { tabSize } = editor.options;
    const { column } = astNode.loc.start;

    const stateCode = codeArray.map((item: any) => {
        const indentation = item.match(/^\s+/);
        let editorIndentation = '';

        if (indentation) {
            editorIndentation = indentation[0].replace(/(\s{2})/g, new Array(tabSize + 1).join(' '));

            if (item) {
                item = item.replace(/^\s+/, editorIndentation);
            }
        }

        return item ? new Array(column + 1).join(' ') + item : item;
    });

    const stateContent = stateCode.join('\n');

    return stateContent;
}

// 编辑器操作队列
const editorQueue: any[] = [];
let editorQueueTimer: any;

function setQueue(callback: any) {
    if (editorQueue.length === 0) {
        editorQueue.push(callback);

        editorQueueTimer = setInterval(() => {
            const run = editorQueue.pop();
            run();
            if (editorQueue.length <= 0) {
                clearInterval(editorQueueTimer);
            }
        }, 100);
    } else {
        editorQueue.push(callback);
    }
}

/**
 * 替换原语句
 * @param code
 * @param astNode
 * @param editor
 */
export function codeReplace(code: any, astNode: any, editor: any) {

    const codes = codeFormat(code, astNode, editor);

    const start = new Position(astNode.loc.start.line - 1, 0);
    const end = new Position(astNode.loc.end.line - 1, astNode.loc.end.column);
    const selection = new Range(start, end);

    setQueue(() => {
        editor.edit((builder: any) => {
            builder.replace(selection, codes);
        });
        // 保存修改
        editor.document.save();
    });
}

/**
 * 插入新语句
 * @param code
 * @param astNode
 * @param editor
 */
export function codeInsert(code: any, astNode: any, editor: any) {
    let codes = codeFormat(code, astNode, editor);
    const position = new Position(astNode.loc.start.line - 1, 0);

    codes = '\n' + codes + '\n\n';

    setQueue(() => {

        // editor.edit((builder: any) => {
        //     builder.insert(position, codes);
        // });

        editor.insertSnippet(new SnippetString(codes), position);

        // 保存修改
        editor.document.save();
    });
}