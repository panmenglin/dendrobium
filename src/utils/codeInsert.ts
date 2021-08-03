import { Position, Range, SnippetString } from 'vscode';

function codeFormat(code: any, astNode: any, editor: any, options?: any) {
    if (code instanceof Array) {
        code = code.join('\n\n');
    }
    const codeArray = code.split('\n');
    const { tabSize } = editor.options;
    let { column } = astNode.loc.start;

    if (options?.format?.column >= 0) {
        column = options.format?.column;
    }

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

function debounce(fn: any, delay: number) {
    let timer: any = null;
    return function () {
        if (timer) {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        } else {
            timer = setTimeout(fn, delay);
        }
    };
}

function runQueneItem() {
    clearInterval(editorQueueTimer);
    editorQueueTimer = setInterval(() => {
        const run = editorQueue.pop();
        run();
        if (editorQueue.length <= 0) {
            clearInterval(editorQueueTimer);
        }
    }, 50);
}

const runQueue = debounce(runQueneItem, 200);

function setQueue(callback: any) {
    editorQueue.push(callback);
    runQueue();
}

/**
 * 替换原语句
 * @param code
 * @param astNode
 * @param editor
 */
export function codeReplace(code: any, astNode: any, editor: any) {
    const codes = codeFormat(code, astNode, editor);

    if (!codes) {
        return;
    }

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

    if (!codes) {
        return;
    }

    const position = new Position(astNode.loc.end.line, 0);

    codes = '\n' + codes + '\n\n';

    setQueue(() => {
        editor.insertSnippet(new SnippetString(codes), position);
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
export function codeInsertBefore(code: any, astNode: any, editor: any, options?: any) {
    let codes = codeFormat(code, astNode, editor, options);

    if (!codes) {
        return;
    }

    const position = new Position(astNode.loc.start.line - 1, 0);

    codes = '\n' + codes + '\n\n';

    setQueue(() => {
        editor.insertSnippet(new SnippetString(codes), position);
        // 保存修改
        editor.document.save();
    });
}