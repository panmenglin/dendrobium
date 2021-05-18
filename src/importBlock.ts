/**
 * 使用组件
 * use components
 */
import * as vscode from 'vscode';
import { getWebViewContent, getNpmRootPath, actuator, getGitRootPath } from './utils/utils';
import { ComponentConfig, LibrarysConfig, LibraryConfig } from './types';
import getGitConfig from './utils/getGitConfig';
import statistics from './statistics';
import { getLibrary, getSnippets } from './service';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

import { window, Memento, workspace, ViewColumn, ExtensionContext, Progress } from 'vscode';

let materialFlag = false;
let panel: any = undefined;

export default async function importBlock(
  context: ExtensionContext,
  state: Memento,
  intl: { get: (key: string) => string, getAll: () => any }
) {

  const libraryConfig: LibrarysConfig | undefined = workspace.getConfiguration().get('dendrobium.librarysConfig');

  // do not set material config
  if (!libraryConfig?.configPath || !libraryConfig?.rootPath) {
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

    initLibraryPanel(context, state, libraryConfig,
      library.library,
      // resolve, 
      progress,
      intl);
  });
}


/**
 * 切换组件库
 * change library
 * @param config 
 */
async function changeLibrary(
  config: LibraryConfig,
  intl: { get: (key: string) => string }
) {

  const components = await getLibrary({
    path: config.path
  });

  panel.webview.postMessage({
    components: components.components
  });
}


/**
 * 初始化 Dendrobium 面板
 * init dendrobium panel
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
  config: LibrarysConfig,
  blockList: any,
  // resolve: () => void,
  progress: Progress<{ increment: number, message: string }>,
  intl: { get: (key: string) => string, getAll: () => any }
) {
  panel = window.createWebviewPanel(
    'libraryView', // webview id
    intl.get('libraryView'), // panel title
    ViewColumn.Beside, // view column
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.onDidReceiveMessage(async (message: any) => {

    // 准备 webview
    // webview ready
    if (message.ready) {
      panel.webview.postMessage({
        warehouse: config,
        intl: intl.getAll(),
        // blocks: blockList,
        library: blockList,
      });

      changeLibrary(blockList[0], intl);

      progress.report({ increment: 100, message: intl.get('libraryViewReady') });
    }

    // 安装组件
    // selected and install component
    if (message.blockSelected) {
      selectBlock(message.blockSelected, state, intl);
    }

    // 切换组件库
    // change library
    if (message.warehouseSelected) {
      changeLibrary(message.warehouseSelected, intl);
    }

    // 组件点赞
    // like some component
    if (message.componentLike) {
      console.log('like', message);
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
  block: ComponentConfig,
  state: Memento,
  intl: { get: (key: string) => string },
  // path?: string,
  prompt?: string
) {

  const answer = await vscode.window.showInformationMessage('该组件会通过 npm 方式安装，同时将为工作区添加组件的代码片段，确定安装吗？', intl.get('yes'), intl.get('cancel'));

  if (answer !== intl.get('yes')) {
    return;
  }

  // 是否有文档
  // 工作区添加文档
  // create doc
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
  // 工作区添加代码片段
  // create snippets
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
  installComponent(block, state, block.defaultPath, intl, path);
}


/**
 * 安装组件
 * install component
 * @param component 
 * @param state 
 * @param pathName 
 */
async function installComponent(
  component: ComponentConfig,
  state: Memento,
  pathName: string,
  intl: { get: (key: string) => string },
  folderPath?: string
) {

  // 获取当前正在编辑的文件
  // get active editor
  let editor: any | undefined = state.get('activeTextEditor');
  let activeEditor: vscode.TextEditor[] = window.visibleTextEditors.filter((item: any) => {
    return item.id === editor.id;
  });

  editor = activeEditor.find(item => {
    return item.document.uri.scheme === 'file';
  });

  if (!editor) {
    return;
  }

  const filePath = editor.document.uri.path;

  // 统计埋点
  // send statistics information
  const gitRootPath = getGitRootPath(filePath);
  const gitUser: any = await getGitConfig(gitRootPath, intl);
  if (gitUser && gitUser.name) {
    statistics({
      type: 'install',
      message: '',
      block: component
    });
  }

  // 组件安装
  // install
  const npmRootPath = getNpmRootPath(filePath);
  if (npmRootPath) {
    // const packagePath = path.resolve(npmRootPath, 'package.json');

    // const packageFile = fs.readFileSync(packagePath, 'utf8');
    // const jsonData = packageFile ? JSON.parse(packageFile) : {};

    // jsonData.dependencies[block.name] = block.version;

    // const packageTpl = JSON.stringify(jsonData, undefined, '\t');

    // fs.writeFile(packagePath, packageTpl, function (err: any) {
    //   if (err) {
    //     throw err;
    //   }
    // });

    // if (packageFile !== packageTpl) {
    const cmdActuator = new actuator({
      cwd: npmRootPath,
    }, (error) => { });

    const packageToolCommand: { [key: string]: string } | undefined = workspace.getConfiguration().get('dendrobium.packageManagementTool');

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: intl.get('loadingInstall'),
    }, (progress, token) => {
      const res = cmdActuator.run(`${packageToolCommand?.install || 'npm install --save'} ${component.name}`).then(() => {
        window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);
        window.showInformationMessage(intl.get('successImport'));
      });

      return res;
    });
    // }
  } else {
    window.setStatusBarMessage(chalk.green(intl.get('successImport')), 1000);
    window.showInformationMessage(intl.get('successImport'));
  }
}
