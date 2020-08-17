const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const { sep } = path;
const ora = require('ora');
const rimraf = require('rimraf');
const mv = require('mv');
import { env } from 'vscode';

interface Actuator {
    run: Function
}
/**
 * 执行器
 * @param {*} options 
 * @param {*} errorCallback 
 */
const actuator = function (this: Actuator, options={}, errorCallback: (err: any) => void) {
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

/**
 * downloadGitRepo
 * @description clone git 项目模版
 * @param {*} target
 */
export default function downloadGitSparse(floderName: string, config: any) {
  const tmpFloderName = `.tmp_${floderName}`;
  const cwd = `${env.appRoot}${sep}dendrobiumTmp${sep}${tmpFloderName}`;

  if (!fs.existsSync(`${env.appRoot}${sep}dendrobiumTmp`)) {
    fs.mkdirSync(`${env.appRoot}${sep}dendrobiumTmp`);
  }
  
  rimraf.sync(cwd);
  rimraf.sync(`${env.appRoot}${sep}dendrobiumTmp${sep}${floderName}`);

  return new Promise(async (resolve, reject) => {

    fs.mkdirSync(cwd);
    
    const message = config.message || `🚚 Cloneing ${config.name} from ${config.downloadUrl}`;
    let spinner = ora(message);
    spinner.start();

    const gitActuator = new actuator({
      cwd,
    }, (error) => {
      spinner && spinner.fail();
      reject(error);
    });

    await gitActuator.run('git init');

    await gitActuator.run(`git remote add -f origin ${config.downloadUrl}`);

    await gitActuator.run('git config core.sparsecheckout true');

    await gitActuator.run(`echo "${config.path}" >> .git/info/sparse-checkout`);

    await gitActuator.run(`git pull origin ${config.branch}`);

    await mvFolder(`${cwd}${sep}${config.path}`, `${env.appRoot}${sep}dendrobiumTmp${sep}${floderName}`);
    
    rimraf.sync(cwd);

    spinner.succeed();
    
    resolve(`${env.appRoot}${sep}dendrobiumTmp${sep}${floderName}`);
  });
}