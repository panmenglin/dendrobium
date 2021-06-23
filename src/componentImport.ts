/**
 * 使用组件
 * use components
 */
import * as vscode from 'vscode';
import { getWebViewContent, pluginConfiguration } from './utils/utils';
import { ComponentConfig, LibrarysConfig, LibraryConfig } from './types';
import { getLibrary, getSnippets, getConfig } from './service';
import configChange from './command/configChange';
import componentInstall from './command/componentInstall';
import componentDownload from './command/componentDownload';

const fs = require('fs');
const chalk = require('chalk');

import { window, Memento, workspace, ViewColumn, ExtensionContext, Progress } from 'vscode';

let materialFlag = false;
let panel: any = undefined;

export default async function componentImport(
  context: ExtensionContext,
  state: Memento,
  intl: { get: (key: string) => string, getAll: () => any }
) {
  const configPath: string | undefined = state.get('configPath');

  // 设置获取配置的地址并查询配置
  if (configPath) {
    const config = await getConfig({
      path: configPath
    });

    if (config) {
      state.update('config', config);
    } else {
      window.showErrorMessage(chalk.red('未能查询到正确的配置'));
    }
  } else {
    const hasConfig = await configChange(context, state, intl);

    if (hasConfig) {
      const configPath: string | undefined = state.get('configPath');

      if (configPath) {

        const config = await getConfig({
          path: configPath
        });

        if (config) {
          state.update('config', config);
        } else {
          window.showErrorMessage(chalk.red('未能查询到正确的配置'));
        }
      }
    }
  }

  const librarysConfig: LibrarysConfig | undefined = pluginConfiguration(state).get('dendrobium.librarysConfig');

  // do not set material config
  if (!librarysConfig?.configPath || !librarysConfig?.rootPath) {
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

    const library = await getLibrary({
      librarysConfig
    });

    initLibraryPanel(context, state, librarysConfig,
      library.library,
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
  state: Memento,
  intl: { get: (key: string) => string }
) {

  const librarysConfig: LibrarysConfig | undefined = pluginConfiguration(state).get('dendrobium.librarysConfig');

  if (!librarysConfig) {
    return;
  }

  const components = await getLibrary({
    path: config.path,
    librarysConfig,
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
 * @param library
 * @param resolve
 * @param progress
 */
function initLibraryPanel(
  context: ExtensionContext,
  state: Memento,
  config: LibrarysConfig,
  library: LibraryConfig[],
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
        library: library,
      });

      changeLibrary(library[0], state, intl);

      progress.report({ increment: 100, message: intl.get('libraryViewReady') });
    }

    // 安装组件
    // selected and install component
    if (message.componentSelected) {
      selectComponent(message.componentSelected, state, intl);
    }

    // 切换组件库
    // change library
    if (message.warehouseSelected) {
      changeLibrary(message.warehouseSelected, state, intl);
    }

    // 组件点赞
    // like some component
    if (message.componentLike) {
      window.showInformationMessage('点赞功能开发中，敬请期待...');
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
 * @param component
 * @param state
 * @param path
//  * @param prompt
 */
async function selectComponent(
  component: ComponentConfig,
  state: Memento,
  intl: { get: (key: string) => string },
) {

  const installMethod = {
    package: '该组件会通过包管理工具安装，同时将为工作区添加组件的代码片段，确定安装吗？',
    download: '该组件将下载安装，同时将为工作区添加组件的代码片段，请选择安装地址。',
    script: '该组件将在当前位置添加 script 标签，同时将为工作区添加组件的代码片段，确定安装吗？',
  };

  let downloadPath = '';
  if (component.installBy === 'download') {
    const folders: any = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    });

    downloadPath = folders[0].path;
  } else {
    const answer = await vscode.window.showInformationMessage(component.installBy ? installMethod[component.installBy] : installMethod.package, intl.get('yes'), intl.get('cancel'));

    if (answer !== intl.get('yes')) {
      return;
    }

  }

  // 是否有文档
  // 工作区添加文档
  // create doc
  if (component.doc) {
    // 遍历工作区所有文件夹添加代码片段
    // TODO 根据组件安装目录添加代码片段
    workspace.workspaceFolders?.map(item => {

      if (!fs.existsSync(`${item.uri.path}/.vscode`)) {
        fs.mkdirSync(`${item.uri.path}/.vscode`);
      }

      const rootPath = `${item.uri.path}/.vscode/${component?.parentCode}.component-docs`;

      let currentDocs: { [key: string]: any } = {};
      if (fs.existsSync(rootPath)) {
        const _currentDocs = fs.readFileSync(rootPath, 'utf-8');

        if (_currentDocs) {
          currentDocs = JSON.parse(_currentDocs);
        }
      }

      // 合并现有的代码片段
      currentDocs[component.code] = {
        title: component.title,
        url: component.doc,
        docFile: component.docFile,
        importName: component.importName,
        elementTag: component.elementTag,
        code: component.code,
        libraryCode: component.parentCode,
        name: component.name,
      };

      // 更新文件
      fs.writeFile(rootPath, JSON.stringify(currentDocs, undefined, '\t'), function (err: any) {
        if (err) {
          throw err;
        }
      });

      // 如果没有引用 写入 other.component-docs
      if (!component.importName && component.docFile) {
        const otherDocPath = `${item.uri.path}/.vscode/other.component-docs`;

        let otherDocs: { [key: string]: any } = {};

        if (fs.existsSync(otherDocPath)) {
          const _otherDocs = fs.readFileSync(rootPath, 'utf-8');

          if (_otherDocs) {
            otherDocs = JSON.parse(_otherDocs);
          }
        }

        // 合并现有的代码片段
        otherDocs[component.code] = {
          title: component.title,
          url: component.doc,
          docFile: component.docFile,
          importName: component.importName,
          elementTag: component.elementTag,
          code: component.code,
          libraryCode: component.parentCode,
          name: component.name,
        };

        // 更新文件
        fs.writeFile(otherDocPath, JSON.stringify(otherDocs, undefined, '\t'), function (err: any) {
          if (err) {
            throw err;
          }
        });
      }
    });
  }

  // 是否有代码片段
  // 工作区添加代码片段
  // create snippets
  if (component.snippets) {

    const snippet = await getSnippets({
      path: component.snippets
    });

    if (snippet) {
      // 遍历工作区所有文件夹添加代码片段
      // TODO 根据组件安装目录添加代码片段
      workspace.workspaceFolders?.map(item => {

        if (!fs.existsSync(`${item.uri.path}/.vscode`)) {
          fs.mkdirSync(`${item.uri.path}/.vscode`);
        }

        const rootPath = `${item.uri.path}/.vscode/${component?.parentCode}.code-snippets`;

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

  switch (component.installBy) {
    case 'package':
      // 通过配置的包管理工具安装
      componentInstall(
        component,
        state,
        intl,
      );
      break;
    case 'download':
      // 下载到用户选择的目录
      componentDownload(component, downloadPath, intl);
      break;
    case 'script':
      // 编辑器中插入 script 标签
      let editor: any | undefined = state.get('activeTextEditor');
      let activeEditor: vscode.TextEditor[] = window.visibleTextEditors.filter((item: any) => {
        return item.id === editor.id;
      });

      editor = activeEditor.find(item => {
        return item.document.uri.scheme === 'file';
      });

      const selection = editor ? editor.selection : undefined;

      if (!selection) {
        return;
      }

      const insertPosition = new vscode.Position(selection.active.line, selection.active.character);

      editor.edit((builder: any) => {
        builder.insert(insertPosition, `<script src="${component.installMethod.script}"></script>\n`);
      });

      break;
    default:
      break;
  }
}
