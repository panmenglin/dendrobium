import { BlockConfig } from './types';
import { window, Position, SnippetString } from 'vscode';
import { pathTansform } from './utils/utils';
const chalk = require('chalk');
import statistics from './statistics';

/**
 * insert block
 * @param editor 
 * @param block 
 * @param pathName 
 */
export default async function insertBlock(editor: any, block: BlockConfig, blockPath: string, intl: { get: (key: string) => void }) {

  const filePath = editor.document.uri.path;
  const insertPath = filePath.replace(/\/(\w|\.)+$/, '');

  const selection = editor ? editor.selection : undefined;

  if (!selection) {
    return;
  }

  // insert block tag
  if (block.type === 'component') {
    const insertPosition = new Position(selection.active.line, selection.active.character);
    const content = `<${block.defaultPath}/>`;
    await editor.insertSnippet(new SnippetString(content), insertPosition);
  }

  // insert block dependencies

  const lines = editor._documentData._lines;

  const jsContentReg = new RegExp(".*(import){1}.*from.*", "g");


  const blockRelationPath = pathTansform(insertPath, blockPath);

  let insertDependence = '';
  if (block.type === 'npm') {
    insertDependence = `import ${block.defaultPath} from '${block.name}'`;
  } else {
    insertDependence = `import ${block.defaultPath} from '${blockRelationPath}'`;
  }

  let insertLineNum = 0;
  let alreadyImport = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line && jsContentReg.exec(line)) {
      insertLineNum = index;
    }

    if (line.indexOf(insertDependence) >= 0) {
      alreadyImport = true;
      break;
    }

    if (((insertLineNum === 0 && index > 10) || (insertLineNum > 0 && index - insertLineNum > 5)) && !jsContentReg.exec(line)) {
      break;
    }
  }

  statistics({
    type: 'insert',
    message: '',
    block
  });

  if (alreadyImport) {
    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);
    return;
  }

  await editor.insertSnippet(new SnippetString(`${insertDependence};` + '\n'), new Position(insertLineNum, 0));
  window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);

}