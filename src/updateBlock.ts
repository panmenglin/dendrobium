import { actuator } from './utils/utils';
import { sep } from 'path';

/**
 * downloadGitRepo
 * @description
 * @param {*} target
 */
export default function upDateBlock(importPath: string, blockName: string, intl: { get: (key: string) => void }, callback: () => void) {

  return new Promise(async (resolve, reject) => {

    const cmdActuator = new actuator({
      cwd: importPath,
    }, (error) => { });

    const gitRootPath = await cmdActuator.run('git rev-parse --show-toplevel');

    const gitActuator = new actuator({
      cwd: gitRootPath.replace(/\n/g, ''),
    }, (error) => {
      //   spinner && spinner.fail();
      // reject(error);
    });

    let status = await gitActuator.run('git status');

    const branchReg = /On branch ([a-z]+)/ig;
    let curBranch = status.match(branchReg);
    curBranch = curBranch ? curBranch[0].split(' ')[2] : '';

    const hasStash = status.indexOf('nothing to commit') < 0;

    if (hasStash) {
      const changeFileList = await gitActuator.run('git diff --name-only');
      if (changeFileList && changeFileList.indexOf(blockName) >= 0) {
        reject(intl.get('pleaseCommit'));
        return;
      }

      await gitActuator.run('git stash save "update block"');
    }

    const updateBlockBranch = `update-block-${+new Date()}`;
    await gitActuator.run(`git checkout -b ${updateBlockBranch}`);

    let log = await gitActuator.run(`git log --pretty=format:"%H" --reverse ${importPath}${sep}${blockName}`);

    const logReg = /([a-z0-9]+)/ig;;
    let oldestLog = log.match(logReg);
    const hash = oldestLog ? oldestLog[0] : '';

    if (hash) {
      await gitActuator.run(`git reset --hard ${hash}`);
    }

    const blockConfig = await callback();

    status = await gitActuator.run('git status');
    const hasChange = status.indexOf('nothing to commit') < 0;

    // content change
    if (hasChange) {
      await gitActuator.run('git add .');
      await gitActuator.run(`git commit -m "refactor: update block ${blockName}"`);
    }

    await gitActuator.run(`git checkout ${curBranch}`);

    gitActuator.run(`git merge ${updateBlockBranch}`).then(async () => {
      if (hasStash) {
        await gitActuator.run('git stash pop');
      }
      await gitActuator.run(`git branch -D ${updateBlockBranch}`);

      resolve(blockConfig);
    }, async () => {
      if (hasStash) {
        await gitActuator.run('git stash pop');
      }
      await gitActuator.run(`git branch -D ${updateBlockBranch}`);

      resolve(blockConfig);
    });

  });
}
