import * as vscode from 'vscode';
import { workspace } from 'vscode';
import { getVSCodeRootPath } from '../utils/utils';
const fs = require('fs');

export async function completionItemsProvide(document: any, position: any) {
    const fileName = document.fileName;

    const curWorkSpacePath = workspace.workspaceFolders?.length === 1 ? workspace.workspaceFolders[0].uri.path : getVSCodeRootPath(fileName);

    const snippetsPath = `${curWorkSpacePath}/.vscode/dendrobium.snippets.json`;

    let snippets = fs.readFileSync(snippetsPath, 'utf8');
    snippets = JSON.parse(snippets);

    const snippetsArray: any = [];
    Object.keys(snippets).forEach(key => {
        const library = snippets[key].children;
        Object.keys(library).forEach(name => {
            const snippet = library[name];

            const snippetCompletion = new vscode.CompletionItem(snippet.prefix);
            const snippetElementContent = snippet.snippets?.body?.element;
            if (!snippetElementContent) {
                return;
            }

            snippetCompletion.insertText = new vscode.SnippetString(snippetElementContent);
            snippetCompletion.detail = snippet.description;
            snippetCompletion.documentation = new vscode.MarkdownString(" ```" + `\n` + snippetElementContent + `\n` + "``` ");
            snippetCompletion.label = name;
            snippetCompletion.filterText = snippet.prefix;
            snippetCompletion.command = {
                command: 'dendrobium.functionInsert', title: 'Dendrobium:functionInsert', arguments: [{
                    item: snippet
                }]
            };

            snippetsArray.push(snippetCompletion);
        });
    });

    return snippetsArray;
};
