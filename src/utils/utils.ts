import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
const mv = require('mv');
const childProcess = require('child_process');

export function getWebViewContent(context: any, templatePath: string) {
    const resourcePath = path.join(context.extensionPath, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    return html;
}

export function mvUnzipFolder(currentPath: string, targetPath: string) {
    return new Promise((resolve, reject) => {
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
 * 执行器
 * @param {*} options 
 * @param {*} errorCallback 
 */
export const actuator = function (this: Actuator, options={}, errorCallback: (err: any) => void) {
  return {
    run: (cmd: string) => new Promise((resolve, reject) => {
      childProcess.exec(cmd, options, (err: any, ...arg: any) => {
        if (err) {
          errorCallback(err);
          return reject(err);
        }

        return resolve(...arg);
      });
    })
  };
} as any as { new (option: {}, errorCallback: (err: any) => void): Actuator; };;


/**
 * mvUnzipFolder
 * @description 移动文件
 * @param {*} currentPath 
 * @param {*} targetPath 
 */
function mvFolder(currentPath: string, targetPath: string) {
    return new Promise((resolve, reject) => {
      mv(currentPath, targetPath, { mkdirp: true, clobber: false }, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }