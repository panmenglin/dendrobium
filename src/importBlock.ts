/**
 * import block
 */
import * as vscode from 'vscode';
import { getWebViewContent, pathTansform } from './utils/utils';
import downloadGitSparse from './utils/downloadGitSparse';
import downloadByNpm from './utils/downloadNpm';
import upDateBlock from './updateBlock';
import { MaterielConfig, BlockConfig } from './types';
import getGitConfig from './utils/getGitConfig';
import statistics from './statistics';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { sep } = path;

import { window, Memento, Position, workspace, ViewColumn, ExtensionContext, SnippetString } from 'vscode';

let materialFlag = false;
let panel: any = undefined;

export default function importBlock(
  context: ExtensionContext,
  state: Memento,
) {
  const materielConfig: MaterielConfig | undefined = workspace.getConfiguration().get('dendrobium.materielWarehouse');

  if (!materielConfig) {
    return;
  }

  let editor: any | undefined = state.get('activeTextEditor');

  if (!editor) {
    window.showErrorMessage(chalk.red(`🚧 Please focus text editor`));
    return;
  }

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

        panel.webview.onDidReceiveMessage(async (message: any) => {

          if (message.blockSelected) {

            const uri = await window.showOpenDialog({
              canSelectFolders: true,
              canSelectFiles: false,
              canSelectMany: false
            });

            selectBlock(message.blockSelected, state, uri ? uri[0].path : uri);
          }
        }, undefined, context.subscriptions);
      },
      err => {
        window.showErrorMessage(chalk.red(`🚧 ${err}`));
      }
    );

}

/**
 * select block
 * @param block 
 * @param state 
 * @param path 
 * @param prompt 
 */
async function selectBlock(block: BlockConfig, state: Memento, path?: string, prompt?: string) {
  const pathName = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: prompt || 'Please setting floder name. example："Example"',
    value: block.defaultPath,
  });


  if (!pathName) {
    return;
  }

  downloadBLock(block, state, pathName, path);
}

/**
 * download block
 * @param block 
 * @param state 
 * @param pathName 
 */
async function downloadBLock(block: BlockConfig, state: Memento, pathName: string, path?: string) {
  let editor: any | undefined = state.get('activeTextEditor');
  let activeEditor: vscode.TextEditor[] = window.visibleTextEditors.filter((item: any) => {
    return item.id === editor.id;
  });

  if (!activeEditor[0]) {
    return;
  }

  const filePath = activeEditor[0].document.uri.path;
  const importPath = path ? path : filePath.replace(/\/(\w|\.)+$/, '');
  const blockPath = `${importPath}${sep}${pathName}`;

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    downloadByNpm(importPath, blockPath, block).then(res => {
      window.showInformationMessage(chalk.green(`🎉 Success import`));
      statistics({
        type: 'add',
        message: ''
      });
    
      insertBlock(activeEditor[0], block, blockPath, pathName);
    });
  } else {
    const gitUser : any = await getGitConfig(importPath);
    
    if (gitUser && gitUser.name) {
      // block already exist, update block
      upDateBlock(importPath, pathName, () => downloadByNpm(importPath, blockPath, block)).then(() => {
        window.showInformationMessage(chalk.green(`🎉 Success update`));
        statistics({
          type: 'update',
          message: ''
        });

        insertBlock(activeEditor[0], block, blockPath, pathName);
      }, (err: any) => {
        window.showErrorMessage(chalk.green(`🚧 ${err}`));
      });
    } else {
      window.showErrorMessage(chalk.red(`🚧 update block need git envirment, please run 'git init' to create git envirment`));
    }
  }
}

/**
 * insert block
 * @param editor 
 * @param block 
 * @param pathName 
 */
async function insertBlock(editor: any, block: BlockConfig, blockPath: string, pathName: string) {

  const filePath = editor.document.uri.path;
  const insertPath = filePath.replace(/\/(\w|\.)+$/, '');

  const selection = editor ? editor.selection : undefined;

  if (!selection) {
    return;
  }

  // insert block tag

  const insertPosition = new Position(selection.active.line, selection.active.character);
  const content = `<${block.defaultPath}/>`;

  await editor.insertSnippet(new SnippetString(content), insertPosition);


  // insert block dependencies

  const lines = editor._documentData._lines;

  const jsContentReg = new RegExp(".*(import){1}.*from.*", "g");

  let insertLineNum = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line && jsContentReg.exec(line)) {
      insertLineNum = index;
    }

    if (((insertLineNum === 0 && index > 10) || (insertLineNum > 0 && index - insertLineNum > 3)) && !jsContentReg.exec(line)) {
      break;
    }
  }

  const blockRelationPath = pathTansform(insertPath, blockPath);

  await editor.insertSnippet(new SnippetString(`import ${block.defaultPath} from '${blockRelationPath}'` + '\n'), new Position(insertLineNum, 0));

  statistics({
    type: 'insert',
    message: ''
  });

  window.showInformationMessage(chalk.green(`🎉 Success insert`));

}
