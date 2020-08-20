// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import importBlock from './importBlock';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const { globalState } = context;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dendrobium" is now active!');

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

	context.subscriptions.push(vscode.commands.registerCommand('dendrobium.importBlock', () => {
		importBlock(context, globalState);
	}));

}

// this method is called when your extension is deactivated
export function deactivate() {}
