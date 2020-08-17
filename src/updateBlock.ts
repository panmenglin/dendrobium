const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const { sep } = path;
const ora = require('ora');
const rimraf = require('rimraf');
const mv = require('mv');
import { actuator } from './utils/utils';

// /**
//  * 执行器
//  * @param {*} options 
//  * @param {*} errorCallback 
//  */
// function actuator (options={}, errorCallback) {
//   return {
//     run: (cmd) => new Promise((resolve, reject) => {
//       childProcess.exec(cmd, options, (err, ...arg) => {
//         if (err) {
//           errorCallback(err);
//           return reject(err);
//         }

//         return resolve(...arg);
//       });
//     })
//   };
// }

// /**
//  * mvUnzipFolder
//  * @description 移动文件
//  * @param {*} currentPath 
//  * @param {*} targetPath 
//  */
// function mvFolder(currentPath, targetPath) {
//   return new Promise((resolve, reject) => {
//     mv(currentPath, targetPath, { mkdirp: true, clobber: false }, err => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

/**
 * downloadGitRepo
 * @description clone git 项目模版
 * @param {*} target
 */
export default function upDateBlock(importPath: string, blockName: string, callback: () => void) {

  return new Promise(async (resolve, reject) => {

    const gitActuator = new actuator({
      cwd: importPath,
    }, (error) => {
    //   spinner && spinner.fail();
      // reject(error);
    });

    let status = await gitActuator.run('git status');
    const branchReg = /On branch ([a-z]+)/ig;
    let curBranch = status.match(branchReg);
    curBranch = curBranch ? curBranch[0].split(' ')[2] : '';

    const hasStash = status.indexOf('nothing to commit') < 0;
    console.log(status);
    
    if (hasStash) {
      const changeFileList = await gitActuator.run('git diff --name-only');
      if (changeFileList && changeFileList.indexOf(blockName) >= 0) {
        reject('您尚未 commit 的内容中可能存在与区块冲突的内容，请先 commit 后再添加');
        return;
      } 

      await gitActuator.run('git stash save "update block"');
    }

    const updateBlockBranch = `update-block-${+new Date()}`;
    await gitActuator.run(`git checkout -b ${updateBlockBranch}`);

    let log = await gitActuator.run(`git log --pretty=format:"%H" --reverse ButtonBasic`);
    const logReg = /([a-z0-9]+)/ig;;
    let oldestLog = log.match(logReg);
    const hash = oldestLog ? oldestLog[0] : '';

    if (hash) {
      await gitActuator.run(`git reset --hard ${hash}`);
    }

    await callback();

    status = await gitActuator.run('git status');
    const hasChange = status.indexOf('nothing to commit') < 0;

    // 有变化
    if (hasChange) {
      await gitActuator.run('git add .');
      await gitActuator.run(`git commit -m "refactor: update block ${blockName}"`);
    }

    await gitActuator.run(`git checkout ${curBranch}`);
    
    gitActuator.run(`git merge ${updateBlockBranch}`).then(() => {
      if (hasStash) {
        gitActuator.run('git stash pop');
      }
      gitActuator.run(`git branch -D ${updateBlockBranch}`);
    }, () => {
      if (hasStash) {
        gitActuator.run('git stash pop');
      }
      gitActuator.run(`git branch -D ${updateBlockBranch}`);
    });

    // spinner.succeed();.
    const floderName = 1;
    resolve(floderName);
  });
}
