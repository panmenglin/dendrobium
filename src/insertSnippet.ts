import { window, Position, SnippetString } from 'vscode';
const chalk = require('chalk');
import statistics from './statistics';
import { BlockConfig } from './types';

/**
 * insert block
 * @param editor 
 * @param block 
 * @param pathName 
 */
export default async function insertSnippet (editor: any, snippet: string, block: BlockConfig, intl: { get: (key: string) => string }) {
  
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
      message: '',
      block
    });
  
    window.setStatusBarMessage(chalk.green(intl.get('successInsert')), 1000);
  
  }