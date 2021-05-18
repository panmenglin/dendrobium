/**
 * 文档预览
 */
import { Memento, ExtensionContext, window, env, Uri } from 'vscode';

export default async function docPreview(
    context: ExtensionContext,
    state: Memento,
    docItem: any,
    intl: { get: (key: string) => string }
) {

    
    // 通过浏览器打开文档
    // 后期优化 可考虑针对 markdown 文件通过本地打开
    const url = Uri.parse(docItem.item.doc);
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
}
