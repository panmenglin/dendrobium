import * as path from 'path';
const { sep } = path;
import * as fs from 'fs';
import * as vscode from 'vscode';
const mv = require('mv');
const childProcess = require('child_process');
const fetch = require('isomorphic-fetch');


/**
 * get webview content
 * @param context 
 * @param templatePath 
 */
export function getWebViewContent(context: any, templatePath: string) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
  });
  return html;
}


/**
 * mv unzip folder
 * @param currentPath 
 * @param targetPath 
 */
export function mvUnzipFolder(currentPath: string, targetPath: string) {
  return new Promise<void>((resolve, reject) => {
    mv(currentPath, targetPath, { mkdirp: true }, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


interface Actuator {
  run: Function
}

/**
 * commond actuator
 * @param {*} options 
 * @param {*} errorCallback 
 */
export const actuator = function (this: Actuator, options = {}, errorCallback: (err: any) => void) {
  return {
    run: (cmd: string) => new Promise<void>((resolve, reject) => {
      childProcess.exec(cmd, options, (err: any, ...arg: any) => {
        if (err) {
          errorCallback(err);
          return reject(err);
        }

        return resolve(...arg);
      });
    })
  };
} as any as { new(option: {}, errorCallback: (err: any) => void): Actuator; };;


/**
 * mvUnzipFolder
 * @description 移动文件
 * @param {*} currentPath 
 * @param {*} targetPath 
 */
export function mvFolder(currentPath: string, targetPath: string) {
  return new Promise<void>((resolve, reject) => {
    mv(currentPath, targetPath, { mkdirp: true, clobber: false }, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


/**
 * tansform position path to relation path
 * @param pathA 
 * @param pathB 
 */
export function pathTansform(pathA: string, pathB: string) {
  const pathArrA = pathA.split('/');
  const pathArrB = pathB.split('/');

  let prevIndex = 0, index = 0;

  while (pathArrA[index] !== undefined || pathArrB[index] !== undefined) {
    if (pathArrA[index] !== pathArrB[index] && prevIndex === 0) {
      prevIndex = index;
    }

    index++;
  }

  let relationPath = '';
  if (pathArrA.length === prevIndex) {
    relationPath = './' + pathArrB.slice(prevIndex).join('/');
  } else {
    const prev = [];
    for (let index = 0; index < pathArrA.length - prevIndex; index++) {
      prev.push('..');
    }

    relationPath = prev.join('/') + '/' + pathArrB.slice(prevIndex).join('/');
  }

  return relationPath;
}


/**
 * get tar ball
 * @param url 
 */
export function getLatestTarball(url: string) {
  return fetch(url).then(async (res: any) => {
    const text = await res.text();
    const tarball = text.match(/"(.+\.tgz)"/g);
    return tarball[0].replace(/"/g, '');
  });
}

/**
 * download template
 * @param url 
 * @param downloadPath 
 */
export function downloadTemplate(url: string, downloadPath: string) {
  return fetch(url).then(async (res: any) => {
    const { body } = res;
    const file = fs.createWriteStream(downloadPath);
    body.pipe(file);
    return new Promise(resolve => {
      body.on('end', resolve);
    });
  });
}


/**
 * get project root path
 */
const rootPathMap: any = {};
export function getRootPath(filePath: string): any {

  if (rootPathMap[filePath]) {
    return rootPathMap[filePath];
  }

  const rootPath = circularPathGetPackageJson(filePath);
  rootPathMap[filePath] = rootPath;

  return rootPath;
}


/**
 * get package.json
 * @param filePath 
 */
function circularPathGetPackageJson(filePath: string): any {
  if (!filePath || filePath === '/') {
    return false;
  }

  const packageJsonPath = `${filePath}${sep}package.json`;

  if (fs.existsSync(packageJsonPath)) {
    return filePath;
  } else {
    return getRootPath(path.join(filePath, '../'));
  }
}

/**
 * get npm root path
 */
export function getNpmRootPath(filePath: string): string {
  const parentPath = path.resolve(filePath, '..');

  if (filePath === '/') {
    return '';
  }

  if (fs.existsSync(path.resolve(parentPath, 'package.json'))) {
    return parentPath;
  } else {
    return getNpmRootPath(parentPath);
  }
}

/**
 * get git root path
 */
export function getGitRootPath(filePath: string): string {
  const parentPath = path.resolve(filePath, '..');

  if (filePath === '/') {
    return '';
  }

  if (fs.existsSync(path.resolve(parentPath, '.git'))) {
    return parentPath;
  } else {
    return getGitRootPath(parentPath);
  }
}

/**
 * get vscode root path
 */
 export function getVSCodeRootPath(filePath: string): string {
  const parentPath = path.resolve(filePath, '..');

  if (filePath === '/') {
    return '';
  }

  if (fs.existsSync(path.resolve(parentPath, '.vscode'))) {
    return parentPath;
  } else {
    return getVSCodeRootPath(parentPath);
  }
}