import { createLogger } from '@sqltools/log/src';
import { DOCS_ROOT_URL, EXT_NAMESPACE } from '@sqltools/util/constants';
import telemetry from '@sqltools/util/telemetry';
import { openExternal } from '@sqltools/vscode/utils';
import { commands, window } from 'vscode';
import { ResponseError } from 'vscode-languageclient';

const log = createLogger('error-handler');

export function create(message: string): (reason: any) => void {
  return async (error: any): Promise<void> => {
    if (error) {
      if (error.dontNotify || (error.data && error.data.dontNotify)) return;
      telemetry.registerException(error, error.data);
      message = `${message} ${
        error.message ? error.message : error.toString()
      }`;
    }
    output(message, error);
  };
}

async function output(message: string, error: ResponseError<any>) {
  log.error('ERROR: %s, %O', message, error);
  const options = ['View Logs'];
  if (error.data && error.data.driver) {
    options.push('Help!');
  }

  switch (await window.showErrorMessage(message, ...options)) {
    case 'View Logs':
      commands.executeCommand(`${EXT_NAMESPACE}.showOutputChannel`);
      break;
    case 'Help!':
      openExternal(
        `${DOCS_ROOT_URL}/connections/${error.data.driver.toLowerCase()}#${
          typeof error.code === 'string' ? error.code : error.name
        }`
      );
      break;
  }
}

const ErrorHandler = {
  output,
  create,
};
export default ErrorHandler;
