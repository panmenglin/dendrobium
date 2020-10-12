import { Memento, ExtensionContext, window } from 'vscode';
const fs = require('fs');
const path = require('path');
const { sep } = path;
const chalk = require('chalk');
import getGitConfig from './utils/getGitConfig';

/**
 * create block
 * @param context 
 * @param state 
 * @param uri 
 */
export default async function createBlock(
  context: ExtensionContext,
  state: Memento,
  uri: any,
  intl: { get: (key: string) => string }
) {

  // cName
  const cName = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockCName')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[\u4e00-\u9fa5]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockCName')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!cName) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockCName')}`);
    return;
  }

  // name
  const name = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockName')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[a-zA-Z0-9_-]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockName')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!name) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockName')}`);
    return;
  }

  // description
  const description = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockDescription')}`,
    value: '',
  });

  if (!description) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockDescription')}`);
    return;
  }

  // git url
  const url = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: intl.get('inputBlockUrl'),
    value: 'https://',
    validateInput: (text: string): string | undefined => {
      const reg = /(http|https):\/\/([\w.]+\/?)\S*/;
      if (text && !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockUrl')}`;
      } else {
        return undefined;
      }
    }
  });

  // npm downloadUrl
  const downloadUrl = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockDownloadUrl')}`,
    value: 'https://',
    validateInput: (text: string): string | undefined => {
      const reg = /(http|https):\/\/([\w.]+\/?)\S*/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockDownloadUrl')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!downloadUrl) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockDownloadUrl')}`);
    return;
  }

  // npmName
  const npmName = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockNpmName')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[a-zA-Z0-9@/_-]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockNpmName')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!npmName) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockNpmName')}`);
    return;
  }

  // path
  const path = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockPath')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[a-zA-Z0-9_-]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockPath')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!path) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockPath')}`);
    return;
  }

  // defaultPath
  const defaultPath = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockDefaultPath')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[a-zA-Z0-9_-]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockDefaultPath')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!path) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockDefaultPath')}`);
    return;
  }

  // type
  const type = await window.showQuickPick(
    [
      "component",
      "npm",
      "snippet",
    ],
    {
      canPickMany: false,
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: intl.get('selectBlockType')
    })
    .then(function (msg) {
      return msg || 'component';
    });

  // tags
  const tags = await window.showQuickPick(
    [
      "React",
      "Vue",
      intl.get('businessComponents'),
      intl.get('tools'),
    ],
    {
      canPickMany: true,
      ignoreFocusOut: true,
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: intl.get('selectBlockTags')
    })
    .then(function (msg) {
      return msg || [];
    });

  // previewUrl
  const previewUrl = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('needInput')}${intl.get('inputBlockPreviewUrl')}`,
    value: 'https://',
    validateInput: (text: string): string | undefined => {
      const reg = /(http|https):\/\/([\w.]+\/?)\S*/;
      if (text && !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockPreviewUrl')}`;
      } else {
        return undefined;
      }
    }
  });

  const blockPath = `${uri.path}${sep}${name}`;

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    initBlock({
      cName,
      name,
      description,
      blockPath,
      url,
      downloadUrl,
      path,
      defaultPath,
      type,
      tags,
      npmName,
      previewUrl
    }, intl);
  } else {
    window.showErrorMessage(intl.get('folderAlreadyExist'));
    reName({
      cName,
      name,
      description,
      blockPath,
      url,
      downloadUrl,
      path,
      defaultPath,
      type,
      tags,
      npmName,
      previewUrl
    }, uri, initBlock, intl);
  }
}


/**
 * init block
 * @param config 
 */
async function initBlock(config: any, intl: { get: (key: string) => string }) {

  fs.mkdirSync(config.blockPath);
  const packagePath = `${config.blockPath}${sep}package.json`;

  // get git config 
  const gitUser: any = await getGitConfig();

  const jsonTemplate = {
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    main: "src/index.js",
    scripts: {},
    dependencies: {
    },
    blockInfo: {
      title: "",
      value: "",
      key: "",
      description: "",
      url: "",
      downloadUrl: "",
      type: "",
      path: "",
      isPage: false,
      defaultPath: "",
      img: "",
      tags: [],
      name: "",
      previewUrl: "",
    }
  };

  Object.assign(jsonTemplate.blockInfo, {
    title: config.cName,
    value: config.name,
    key: config.name,
    description: config.description,
    url: config.url,
    downloadUrl: config.downloadUrl,
    type: config.type,
    path: config.path,
    defaultPath: config.defaultPath,
    tags: config.tags,
    name: config.npmName,
    previewUrl: config.previewUrl,
  });

  Object.assign(jsonTemplate, {
    name: `${config.name}`,
    author: gitUser.name && gitUser.email ? `${gitUser.name}${gitUser.email}` : '',
    description: `${config.description}`
  });

  const packageTemplate = JSON.stringify(jsonTemplate, undefined, '\t');

  fs.writeFile(packagePath, packageTemplate, function (err: any) {
    if (err) {
      throw err;
    }
  });

  fs.mkdirSync(`${config.blockPath}${sep}src`);

  window.showInformationMessage(intl.get('createBlockSuccess'));
}


/**
 * retry name
 * folder already exist
 * @param config 
 * @param uri 
 * @param callback 
 */
async function reName(config: any, uri: any, callback: Function, intl: { get: (key: string) => string }) {

  const name = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: `${intl.get('folderAlreadyExist')}`,
    value: '',
    validateInput: (text: string): string | undefined => {
      const reg = /^[a-zA-Z0-9_-]+$/;
      if (!text || !reg.test(text)) {
        return `${intl.get('needInput')}${intl.get('validateInput')}${intl.get('inputBlockName')}`;
      } else {
        return undefined;
      }
    }
  });

  if (!name) {
    window.showErrorMessage(`${intl.get('needInput')}${intl.get('inputBlockName')}`);
    return;
  }

  const blockPath = `${uri.path}${sep}${name}`;

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    callback({
      ...config,
      name,
      value: name,
      key: name,
      blockPath
    }, intl);
  } else {
    window.showErrorMessage(intl.get('folderAlreadyExist'));
    reName(config, uri, callback, intl);
  }
}