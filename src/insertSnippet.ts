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
export default async function insertSnippet (editor: any, snippet: string, intl: { get: (key: string) => void }) {

    const filePath = editor.document.uri.path;
    const insertPath = filePath.replace(/\/(\w|\.)+$/, '');
  
    const selection = editor ? editor.selection : undefined;
  
    if (!selection) {
      return;
    }
  
    // insert block tag
  
    const insertPosition = new Position(selection.active.line, selection.active.character);
    const content = snippet;
  
    await editor.insertSnippet(new SnippetString(content), insertPosition);
  
  
    statistics({
      type: 'insertSnippet',
      message: ''
    });
  
    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);
  
  }