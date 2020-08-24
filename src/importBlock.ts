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
import localize from './locales';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { sep } = path;

import { window, Memento, Position, workspace, ViewColumn, ExtensionContext, SnippetString, Progress } from 'vscode';

const language: 'zh-cn' | 'en' = workspace.getConfiguration().get('dendrobium.language') || 'zh-cn';
const intl = localize(language);

let materialFlag = false;
let panel: any = undefined;

export default async function importBlock(
  context: ExtensionContext,
  state: Memento,
) {
  const materielConfig: MaterielConfig[] | undefined = workspace.getConfiguration().get('dendrobium.materielWarehouse');

  if (!materielConfig) {
    return;
  }

  let editor: any | undefined = state.get('activeTextEditor');

  if (!editor) {
    window.showErrorMessage(chalk.red(intl.get('noTextEditor')));
    return;
  }

  // prevent duplicate loading
  if (materialFlag && panel) {
    panel.reveal(ViewColumn.Beside);
    return;
  }


  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: intl.get('loadingMaterial'),
  }, (progress, token) => {

    progress.report({ increment: 0, message: intl.get('fetchingConfig') });

    const progressPromise = new Promise((resolve) => {
      downloadGitSparse(materielConfig[0].path, {
        ...materielConfig[0],
        message: `🚚 ${intl.get('loadingMaterial')}`
      })
        .then(
          (path) => {
            const blockList = JSON.parse(fs.readFileSync(path, 'utf-8'));

            progress.report({ increment: 60, message: intl.get('initMaterialView') });

            initMaterialPanel(context, state, materielConfig, blockList, resolve, progress);
          },
          err => {
            window.showErrorMessage(chalk.red(`${err}`));
          }
        );
    });

    return progressPromise;
  });
}


/**
 * init material panel
 * @param context 
 * @param state 
 * @param config 
 * @param blockList 
 * @param resolve 
 * @param progress 
 */
function initMaterialPanel(
  context: ExtensionContext,
  state: Memento,
  config: MaterielConfig[] | undefined,
  blockList: string,
  resolve: () => void,
  progress: Progress<{ increment: number, message: string }>
) {
  panel = window.createWebviewPanel(
    'materialView', // webview id
    'Material List', // panel title
    ViewColumn.Beside, // view column
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.onDidReceiveMessage(async (message: any) => {
    setTimeout(() => {
      resolve();
    }, 300);

    if (message.ready) {
      panel.webview.postMessage({
        warehouse: config,
        intl: intl.getAll(),
        blocks: blockList,
      });

      progress.report({ increment: 100, message: intl.get('materialViewReady') });
    }

    if (message.blockSelected) {

      const uri = await window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false
      });

      selectBlock(message.blockSelected, state, uri ? uri[0].path : uri);
    }
  }, undefined, context.subscriptions);

  materialFlag = true;

  panel.onDidDispose(() => {
    materialFlag = false;
  });

  const htmlcontent = getWebViewContent(context, 'src/view/materiel/materiel.html');
  panel.webview.html = htmlcontent;

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
    prompt: prompt || intl.get('setFolderName'),
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
      window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);

      statistics({
        type: 'add',
        message: ''
      });

      insertBlock(activeEditor[0], block, blockPath, pathName);
    });
  } else {
    vscode.window.showInformationMessage(intl.get('updateComfirm'), intl.get('yes'), intl.get('cancel'))
      .then(async (answer) => {
        if (answer === intl.get('yes')) {
          const gitUser: any = await getGitConfig(importPath, intl);

          if (gitUser && gitUser.name) {
            // block already exist, update block
            upDateBlock(importPath, pathName, () => downloadByNpm(importPath, blockPath, block)).then(() => {
              window.setStatusBarMessage(chalk.green(intl.get('successUpdate')), 1000);

              statistics({
                type: 'update',
                message: ''
              });

              insertBlock(activeEditor[0], block, blockPath, pathName);
            }, (err: any) => {
              window.showErrorMessage(chalk.green(`🚧 ${err}`));
            });
          } else {
            window.showErrorMessage(chalk.red(intl.get('noGit')));
          }
        }
      });
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
  const blockRelationPath = pathTansform(insertPath, blockPath);
  const insertDependence = `import ${block.defaultPath} from '${blockRelationPath}'`;

  let insertLineNum = 0;
  let alreadyImport = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line && jsContentReg.exec(line)) {
      insertLineNum = index;
    }

    if (line.indexOf(insertDependence) >= 0) {
      alreadyImport = true;
      break;
    }

    if (((insertLineNum === 0 && index > 10) || (insertLineNum > 0 && index - insertLineNum > 5)) && !jsContentReg.exec(line)) {
      break;
    }
  }

  if (alreadyImport) {
    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);
    return;
  }

  await editor.insertSnippet(new SnippetString(`${insertDependence};` + '\n'), new Position(insertLineNum, 0));

  statistics({
    type: 'insert',
    message: ''
  });

  window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);

}
