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
  window.showInformationMessage('create block');
  console.log(uri.path);

  const name = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: intl.get('inputBlockName'),
    value: '',
  });


  if (!name) {
    return;
  }

  const description = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: intl.get('inputBlockDescription'),
    value: '',
  });


  if (!description) {
    return;
  }

  const blockPath = `${uri.path}${sep}${name}`;

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    initBlock({
      name,
      description,
      blockPath
    });
  } else {
    console.warn(chalk.yellow(intl.get('folderAlreadyExist')));
    reName({
      name,
      description
    }, uri, initBlock, intl);
  }
}

/**
 * init block
 * @param config 
 */
async function initBlock(config: any) {

  fs.mkdirSync(config.blockPath);
  const packagePath = `${config.blockPath}${sep}package.json`;

  // get git config 
  const gitUser: any = await getGitConfig();

  const jsonTemplate = {
    "name": "",
    "version": "1.0.0",
    "description": "",
    "main": "src/index.js",
    "scripts": {},
    "dependencies": {
    }
  };

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

}


/**
 * retry name
 * @param config 
 * @param uri 
 * @param callback 
 */
async function reName(config: any, uri: any, callback: Function, intl: { get: (key: string) => string }) {

  const name = await window.showInputBox({
    ignoreFocusOut: true,
    prompt: '请输入组件名称',
    value: '',
  });


  if (!name) {
    return;
  }

  const blockPath = `${uri.path}${sep}${name}`;

  if (!fs.existsSync(blockPath) || fs.existsSync(blockPath) && fs.readdirSync(blockPath).length === 0) {
    callback({
      ...config,
      name,
      blockPath
    });
  } else {
    console.warn(chalk.yellow(intl.get('folderAlreadyExist')));
    reName(config, uri, callback, intl);
  }

}