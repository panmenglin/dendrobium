const ora = require('ora');
const path = require('path');
const { sep } = path;
const rimraf = require('rimraf');
const targz = require('targz');
const fs = require('fs');

import { BlockConfig } from '../types';
import { mvUnzipFolder, getLatestTarball, downloadTemplate } from './utils';

/**
 * download by npm
 * @param {*} config 
 */
export default async function downloadByNpm(importPath: string, blockPath: string, config: BlockConfig) {
  return new Promise(async (resolve, reject) => {

    let blockName: string | undefined = config.value;

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
      async function (err: any) {
        rimraf.sync(blockPath);

        await mvUnzipFolder(`${blockPath}_tmp${sep}package${sep}src`, blockPath);

        rimraf.sync(tgzFileName);
        rimraf.sync(`${blockPath}_tmp`);

        const snippetPath = `${blockPath}${sep}snippet.bium`;
        let snippet = '';
        if (fs.existsSync(snippetPath)) {
          snippet = fs.readFileSync(snippetPath, 'utf-8');

          if (fs.existsSync(blockPath) && fs.readdirSync(blockPath).length <= 1) {
            blockName = undefined;
          }
        }

        rimraf.sync(snippetPath);

        spinner.stop();

        resolve({
          blockName,
          snippet
        });
      }
    );
  });
}