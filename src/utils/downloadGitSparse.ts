const fs = require('fs');
const childProcess = require('child_process');
const path = require('path');
const { sep } = path;
const ora = require('ora');
const rimraf = require('rimraf');
const mv = require('mv');
import { env } from 'vscode';
import { actuator, mvFolder } from './utils';

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