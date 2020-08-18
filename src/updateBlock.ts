import { actuator } from './utils/utils';

/**
 * downloadGitRepo
 * @description
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
        reject('The content that you have not committed may conflict with the block. Please commit before updating');
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
