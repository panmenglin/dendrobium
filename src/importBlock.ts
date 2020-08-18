/**
 * import block
 */
import * as vscode from 'vscode';
import { getWebViewContent } from './utils/utils';
import downloadGitSparse from './utils/downloadGitSparse';
import downloadByNpm from './utils/downloadNpm';
import upDateBlock from './updateBlock';
import { MaterielConfig, BlockConfig } from './types';

const fs = require('fs');
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const path = require('path');
const { sep } = path;

import { window, Memento, Selection, Position, workspace, ViewColumn, ExtensionContext, env } from 'vscode';

let materialFlag = false;
let panel: any = undefined;

export default function importBlock(
  context: ExtensionContext,
  state: Memento,
) {
  const materielConfig: MaterielConfig | undefined = workspace.getConfiguration().get('dendrobium.materielWarehouse');

  if (materielConfig) {

    // 阻止重复加载
    if (materialFlag && panel) {
      panel.reveal(ViewColumn.Beside);
      return;
    }

    panel = window.createWebviewPanel(
      'materielView', // webview id
      'Materiel List', // panel title
      ViewColumn.Beside, // view column
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    materialFlag = true;

    panel.onDidDispose(() => {
      materialFlag = false;
    });

    const htmlcontent = getWebViewContent(context, 'src/view/materiel/materiel.html');
    panel.webview.html = htmlcontent;

    downloadGitSparse(materielConfig.path, {
      ...materielConfig,
      message: `🚚 Fetching block list`
    })
      .then(
        (path) => {
          window.showInformationMessage(chalk.green(`🎉 Success git clone`));
          const blockList = JSON.parse(fs.readFileSync(path, 'utf-8'));

          panel.webview.postMessage({ blocks: blockList });
          
            panel.webview.onDidReceiveMessage((message: any) => {

              if (message.blockSelected) {
                selectBlock(message.blockSelected, state);
              }
            }, undefined, context.subscriptions);
        },
        err => {
          window.showInformationMessage(chalk.red(`🚧 ${err}`));
        }
      );
  }


  //   const content = await fetchSnippetsContent({
  //     id: snippet.id
  //   }, state);

  // let editor: { document: any } | undefined = window.activeTextEditor;


  // if (editor) {
  //   const filePath = editor.document.uri.path;
  //   const importPath = filePath.replace(/\/(\w|\.)+$/, '');

  //   console.log(importPath);
  //   //     let selection: Selection = editor.selection;
  //   //     let insertPosition = new Position(selection.active.line, 0);
  //   //     editor.insertSnippet(new SnippetString(content), insertPosition);
  // }
}


async function selectBlock(block: BlockConfig, state: Memento, prompt?: string) {
  const pathName = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: prompt || 'Please setting floder name. example："Example"',
    value: block.defaultPath,
  });


  if (!pathName) {
    return;
  }

  let editor: { _documentData: any } | undefined = state.get('activeTextEditor');
  
  if (!editor) {
    return;
  }

  const filePath = editor._documentData._uri.path;
  const importPath = filePath.replace(/\/(\w|\.)+$/, '');
  const blockPath = `${importPath}${sep}${pathName}`;

  //     let selection: Selection = editor.selection;
  //     let insertPosition = new Position(selection.active.line, 0);
  //     editor.insertSnippet(new SnippetString(content), insertPosition);

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    downloadByNpm(importPath, blockPath, block).then(res => {
      window.showInformationMessage(chalk.green(`🎉 Success import`));
    });
  } else {
    
    // block already exist, update block
    upDateBlock(importPath, pathName, () => downloadByNpm(importPath, blockPath, block)).then(() => {
      window.showInformationMessage(chalk.green(`🎉 Success update`));
    }, (err: any) => {
      window.showInformationMessage(chalk.green(`🚧 ${err}`));
    });
  }

}