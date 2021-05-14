/**
 * import block
 */
import * as vscode from 'vscode';
import { getWebViewContent } from './utils/utils';
import downloadGitSparse from './utils/downloadGitSparse';
import downloadByNpm from './utils/downloadNpm';
import upDateBlock from './updateBlock';
import { MaterialConfig, BlockConfig } from './types';
import getGitConfig from './utils/getGitConfig';
import statistics from './statistics';
import insertBlock from './insertBlock';
import insertSnippet from './insertSnippet';
import updatePackage from './updatePackage';
import { getLibrary, getSnippets } from './service';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const { sep } = path;

import { window, Memento, workspace, ViewColumn, ExtensionContext, Progress } from 'vscode';

let materialFlag = false;
let panel: any = undefined;

export default async function importBlock(
  context: ExtensionContext,
  state: Memento,
  intl: { get: (key: string) => string, getAll: () => any }
) {

  const materialConfig: MaterialConfig[] | undefined = workspace.getConfiguration().get('dendrobium.materialWarehouse');;

  // do not set material config
  if (!materialConfig || materialConfig.length === 0) {
    window.showErrorMessage(chalk.red(intl.get('noMaterialConfig')));
    return;
  }

  // can not find text editor
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
  }, async (progress, token) => {

    progress.report({ increment: 0, message: intl.get('fetchingConfig') });

    const library = await getLibrary();

    // const blockList = JSON.parse(fs.readFileSync(path, 'utf-8'));
    // progress.report({ increment: 60, message: intl.get('initMaterialView') });

    // const libraryMay: { [key: string]: string } = {};

    // library..map((item: any) => {
    //   libraryMay[item.code] = item;
    // });


    initLibraryPanel(context, state, materialConfig,
      library.library,
      // resolve, 
      progress,
      intl);

    // const progressPromise = new Promise<void>((resolve, reject) => {
    //   downloadGitSparse(materialConfig[0].path, {
    //     ...materialConfig[0],
    //     message: `🚚 ${intl.get('loadingMaterial')}`
    //   })
    //     .then(
    //       (path) => {
    //         const blockList = JSON.parse(fs.readFileSync(path, 'utf-8'));

    //         progress.report({ increment: 60, message: intl.get('initMaterialView') });

    //         initMaterialPanel(context, state, materialConfig, blockList, resolve, progress, intl);
    //       },
    //       err => {
    //         window.showErrorMessage(chalk.red(`${err}`));
    //         reject();
    //       }
    //     );
    // });

    // return progressPromise;
  });
}


/**
 * change warehouse
 * @param config 
 */
async function changeWarehouse(
  config: MaterialConfig,
  intl: { get: (key: string) => string }
) {

  const components = await getLibrary({
    path: config.path
  });


  panel.webview.postMessage({
    components: components.components
  });

  // getLibrary()
  // downloadGitSparse(config.path, {
  //   ...config,
  //   message: `🚚 ${intl.get('loadingMaterial')}`
  // })
  //   .then(
  //     (path) => {
  //       const blockList = JSON.parse(fs.readFileSync(path, 'utf-8'));

  //       panel.webview.postMessage({
  //         blocks: blockList,
  //       });
  //     },
  //     err => {
  //       window.showErrorMessage(chalk.red(`${err}`));
  //     }
  //   );
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
function initLibraryPanel(
  context: ExtensionContext,
  state: Memento,
  config: MaterialConfig[] | undefined,
  blockList: any,
  // resolve: () => void,
  progress: Progress<{ increment: number, message: string }>,
  intl: { get: (key: string) => string, getAll: () => any }
) {
  panel = window.createWebviewPanel(
    'materialView', // webview id
    intl.get('materialView'), // panel title
    ViewColumn.Beside, // view column
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );


  panel.webview.onDidReceiveMessage(async (message: any) => {
    // setTimeout(() => {
    //   resolve();
    // }, 300);

    // webview ready
    if (message.ready) {
      panel.webview.postMessage({
        warehouse: config,
        intl: intl.getAll(),
        // blocks: blockList,
        library: blockList,
      });

      changeWarehouse(blockList[0], intl);

      progress.report({ increment: 100, message: intl.get('materialViewReady') });
    }

    // selected block
    if (message.blockSelected) {
      // let uri;
      // if (message.blockSelected.type !== 'npm') {
      //   uri = await window.showOpenDialog({
      //     canSelectFolders: true,
      //     canSelectFiles: false,
      //     canSelectMany: false
      //   });

      //   if (uri && uri[0].path.indexOf(' ') >= 0) {
      //     window.showErrorMessage(chalk.red(intl.get('blankInName')));
      //     return;
      //   }
      // }


      selectBlock(message.blockSelected, state, intl,
        // uri ? uri[0].path : uri
      );
    }

    // change warehouse
    if (message.warehouseSelected) {
      changeWarehouse(message.warehouseSelected, intl);
    }

  }, undefined, context.subscriptions);

  materialFlag = true;

  panel.onDidDispose(() => {
    materialFlag = false;
  });

  const htmlcontent = getWebViewContent(context, 'view/material/material.html');
  panel.webview.html = htmlcontent;

}


/**
 * select component
 * 安装组件和代码片段
 * @param block 
 * @param state 
 * @param path 
 * @param prompt 
 */
async function selectBlock(
  block: BlockConfig,
  state: Memento,
  intl: { get: (key: string) => string },
  // path?: string,
  prompt?: string
) {

  // 是否有文档
  if (block.doc) {
    // 遍历工作区所有文件夹添加代码片段
    // 后期优化 根据组件安装目录添加代码片段
    workspace.workspaceFolders?.map(item => {
      const rootPath = `${item.uri.path}/.vscode/${block?.parentCode}.component-docs`;

      let currentDocs: { [key: string]: any } = {};
      if (fs.existsSync(rootPath)) {
        const _currentDocs = fs.readFileSync(rootPath, 'utf-8');

        if (_currentDocs) {
          currentDocs = JSON.parse(_currentDocs);
        }
      }

      // 合并现有的代码片段
      currentDocs[block.code] = {
        name: block.title,
        url: block.doc,
        code: block.code,
      };

      // 更新文件
      fs.writeFile(rootPath, JSON.stringify(currentDocs, undefined, '\t'), function (err: any) {
        if (err) {
          throw err;
        }
      });
    });
  }


  // 是否有代码片段
  if (block.snippets) {
    const snippet = await getSnippets({
      path: block.snippets
    });

    if (snippet) {
      // 遍历工作区所有文件夹添加代码片段
      // 后期优化 根据组件安装目录添加代码片段
      workspace.workspaceFolders?.map(item => {
        const rootPath = `${item.uri.path}/.vscode/${block?.parentCode}.code-snippets`;

        let currentSnippets: { [key: string]: any } = {};
        if (fs.existsSync(rootPath)) {
          const _currentSnippets = fs.readFileSync(rootPath, 'utf-8');

          if (_currentSnippets) {
            currentSnippets = JSON.parse(_currentSnippets);
          }
        }

        // 合并现有的代码片段
        Object.keys(snippet).forEach(key => {
          currentSnippets[key] = snippet[key];
        });

        // 更新文件
        fs.writeFile(rootPath, JSON.stringify(currentSnippets, undefined, '\t'), function (err: any) {
          if (err) {
            throw err;
          }
        });
      });
    }

  }

  // 本期仅支持 npm 安装
  // downloadBLock(block, state, block.defaultPath, intl, path);

  // if (block.type === 'npm') {
  //   downloadBLock(block, state, block.defaultPath, intl, path);
  //   return;
  // }

  // const pathName = await window.showInputBox({
  //   ignoreFocusOut: true,
  //   prompt: prompt || intl.get('setFolderName'),
  //   value: block.defaultPath,
  // });


  // if (!pathName) {
  //   return;
  // }

  // downloadBLock(block, state, pathName, intl, path);
}


/**
 * download block
 * @param block 
 * @param state 
 * @param pathName 
 */
async function downloadBLock(
  block: BlockConfig,
  state: Memento,
  pathName: string,
  intl: { get: (key: string) => string },
  folderPath?: string
) {
  let editor: any | undefined = state.get('activeTextEditor');
  let activeEditor: vscode.TextEditor[] = window.visibleTextEditors.filter((item: any) => {
    return item.id === editor.id;
  });

  if (!activeEditor[0]) {
    return;
  }

  const filePath = activeEditor[0].document.uri.path;
  const importPath = folderPath ? folderPath : filePath.replace(/\/(\w|\.)+$/, '');
  const blockPath = `${importPath}${sep}${pathName}`;

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: intl.get('loadingInstall'),
  }, (progress, token) => {


    return downloadByNpm(importPath, blockPath, block, progress, intl).then((res: any) => {
      window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);

      statistics({
        type: 'add',
        message: '',
        block
      });

      // insert snippet
      // if (res.snippet) {
      //   insertSnippet(activeEditor[0], res.snippet, block, intl);
      // }

      // insert block
      // if (res.blockName) {
      //   insertBlock(activeEditor[0], block, blockPath, intl);
      // }

      if (res.packageJson) {
        updatePackage(filePath, res.packageJson, block, intl);
      }

    });

    // if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    //   return downloadByNpm(importPath, blockPath, block, progress, intl).then((res: any) => {
    //     window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);

    //     statistics({
    //       type: 'add',
    //       message: '',
    //       block
    //     });

    //     // insert snippet
    //     if (res.snippet) {
    //       insertSnippet(activeEditor[0], res.snippet, block, intl);
    //     }

    //     // insert block
    //     if (res.blockName) {
    //       insertBlock(activeEditor[0], block, blockPath, intl);
    //     }

    //     if (res.packageJson) {
    //       updatePackage(filePath, res.packageJson, block, intl);
    //     }

    //   });
    // } else {
    //   return vscode.window.showInformationMessage(intl.get('updateComfirm'), intl.get('yes'), intl.get('cancel'))
    //     .then(async (answer) => {
    //       if (answer === intl.get('yes')) {
    //         const gitUser: any = await getGitConfig(importPath, intl);

    //         if (gitUser && gitUser.name) {
    //           // block already exist, update block
    //           return upDateBlock(importPath, pathName, intl, () => downloadByNpm(importPath, blockPath, block, progress, intl)).then((res: any) => {
    //             window.setStatusBarMessage(chalk.green(intl.get('successUpdate')), 1000);

    //             statistics({
    //               type: 'update',
    //               message: '',
    //               block
    //             });

    //             // insert snippet
    //             if (res.snippet) {
    //               insertSnippet(activeEditor[0], res.snippet, block, intl);
    //             }

    //             // insert block
    //             if (res.blockName) {
    //               insertBlock(activeEditor[0], block, blockPath, intl);
    //             }

    //             // update package
    //             if (res.packageJson) {
    //               updatePackage(filePath, res.packageJson, block, intl);
    //             }

    //           }, (err: any) => {
    //             window.showErrorMessage(chalk.red(`🚧 ${err}`));
    //           });
    //         } else {
    //           window.showErrorMessage(chalk.red(intl.get('noGit')));
    //         }
    //       }
    //     });
    // }

  });

}
