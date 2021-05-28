/**
 * 文档预览
 */
import { Memento, ExtensionContext, window, env, Uri } from 'vscode';
import statistics from '../statistics';

export default async function docPreview(
    context: ExtensionContext,
    state: Memento,
    docItem: any,
    intl: { get: (key: string) => string }
) {


    // 通过浏览器打开文档
    // TODO 可考虑针对 markdown 文件通过本地打开
    const url = Uri.parse(docItem.item.url);
    env.openExternal(url);

    // if (!docItem.item.doc) {
    //     return;
    // }

    // // markdown格式
    // if (docItem.item.doc.includes('.md')) {

    // }
    // // 默认网页格式
    // else {
    // const url = Uri.parse(docItem.item.doc);
    // env.openExternal(url);
    // }

    // 文档预览埋点
    statistics({
        type: 'docView',
        component: {
            code: docItem.item.code,
        },
        library: {
            code: docItem.item.libraryCode,
        }
    });
}
