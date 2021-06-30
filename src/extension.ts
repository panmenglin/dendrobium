// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import componentImport from './componentImport';
import { TreeViewProvider } from './componentsView';
import docPreview from './command/docPreview';
import { snippetInsert, functionInsert } from './command/snippetInsert';
import snippetHover from './command/snippetHover';
import configChange from './command/configChange';
import componentInstall from './command/componentInstall';
import { completionItemsProvide, completionItemResolve } from './command/completionItemsProvider';
import localize from './locales';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const { globalState } = context;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json


	// set active text editor
	globalState.update('activeTextEditor', vscode.window.activeTextEditor);
	vscode.window.onDidChangeActiveTextEditor(function (editor) {
		if (editor) {
			globalState.update('activeTextEditor', editor);
		}
	});

	const language: 'zh-cn' | 'en' = vscode.workspace.getConfiguration().get('dendrobium.language') || 'zh-cn';
	const intl = localize(language);

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.componentImport', () => {
		componentImport(context, globalState, intl);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.docPreview', (docItem) => {
		docPreview(context, globalState, docItem, intl);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.snippetInsert', (snippetItem) => {
		snippetInsert(context, globalState, snippetItem, intl);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.functionInsert', (snippetItem) => {
		functionInsert(context, globalState, snippetItem, intl);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.configChange', (snippetItem) => {
		configChange(context, globalState, intl);
	}));

	context.subscriptions.push(vscode.languages.registerHoverProvider(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], {
		provideHover: snippetHover
	}));

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(['javascript', 'typescript', 'javascriptreact', 'typescriptreact'], {
		provideCompletionItems(document, position) {
			return completionItemsProvide(document, position);
		},
		// resolveCompletionItem(item, token) {
		// 	// return completionItemResolve();
		// // 	console.log(1212121);
		// 	console.log(item);
		// 	// const completionItem2 = new vscode.CompletionItem(`
		// 	// 	<Table
		// 	// 		columns={this.columns}
		// 	// 		rowKey={record => record.id}
		// 	// 		dataSource={data}
		// 	// 		pagination={pagination}
		// 	// 		loading={this.loading}
		// 	// 		onChange={this.handleTableChange}
		// 	// 	/>
		// 	// `);
		// 	return item;
		// }
	}));


	const treeViewProvider = new TreeViewProvider(globalState);

	context.subscriptions.push(vscode.window.registerTreeDataProvider('components-view', treeViewProvider));

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.treeViewRefresh', () => {
		treeViewProvider.refresh();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() { }
