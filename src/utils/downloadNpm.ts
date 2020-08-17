const fetch = require('isomorphic-fetch');
const ora = require('ora');
const path = require('path');
const { sep } = path;
const rimraf = require('rimraf');
const targz = require('targz');
const fs = require('fs');
const logSymbols = require('log-symbols');
const chalk = require('chalk');

import { BlockConfig } from '../types';
import { mvUnzipFolder } from './utils';

function getLatestTarball(url: string) {
    return fetch(url).then(async (res: any) => {
      const text = await res.text();
      const tarball = text.match(/"(.+\.tgz)"/g);
      return tarball[0].replace(/"/g, '');
    });
  }


function downloadTemplate(url: string, downloadPath: string) {
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
 * download by npm
 * @param {*} config 
 */
export default async function downloadByNpm(importPath: string, blockPath: string, config: BlockConfig) {
    return new Promise(async (resolve, reject) => {
    
      const blockName = config.value;
  
      let spinner = ora('🚚 Downloading...');
      spinner.start();
  
      const downloadUrl: string = await getLatestTarball(config.downloadUrl);
  
      await downloadTemplate(downloadUrl, `${importPath}${sep}${blockName}.tgz`);
      spinner.stop();
  
      spinner = ora('Unzipping files...');
      spinner.start();
  
      const tgzFileName = `${importPath}${sep}${blockName}.tgz`;
      rimraf.sync(blockPath);
  
      targz.decompress(
        {
          src: tgzFileName,
          dest: `${blockPath}_tmp`,
          tar: {
            readable: true,
            writable: true
          }
        },
        async function(err: any) {
          rimraf.sync(blockPath);
  
          await mvUnzipFolder(`${blockPath}_tmp${sep}package${sep}src`, blockPath);
  
          rimraf.sync(tgzFileName);
          rimraf.sync(`${blockPath}_tmp`);
          
          spinner.stop();
          console.log(`\n ${logSymbols.success}`, chalk.green(`🎉 Success install`));
  
          resolve(blockName);
        }
      );
    });
  }