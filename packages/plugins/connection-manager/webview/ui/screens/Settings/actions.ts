import { DefaultUIAction } from '@sqltools/vscode/webview-provider/action';

export const UIAction = {
  ...DefaultUIAction,

  REQUEST_INSTALLED_DRIVERS: 'REQUEST:INSTALLED_DRIVERS' as const,

  REQUEST_OPEN_CONNECTION_FILE: 'REQUEST:OPEN_CONNECTION_FILE' as const,
  REQUEST_EDIT_CONNECTION: 'REQUEST:EDIT_CONNECTION' as const,
  REQUEST_CREATE_CONNECTION: 'REQUEST:CREATE_CONNECTION' as const,
  REQUEST_UPDATE_CONNECTION: 'REQUEST:UPDATE_CONNECTION' as const,
  REQUEST_TEST_CONNECTION: 'REQUEST:TEST_CONNECTION' as const,
  REQUEST_DRIVER_SCHEMAS: 'REQUEST:DRIVER_SCHEMAS' as const,
  RESPONSE_DRIVER_SCHEMAS: 'RESPONSE:DRIVER_SCHEMAS' as const,

  RESPONSE_INSTALLED_DRIVERS: 'RESPONSE:INSTALLED_DRIVERS' as const,
  RESPONSE_UPDATE_CONNECTION_SUCCESS: 'RESPONSE:UPDATE_CONNECTION_SUCCESS' as const,
  RESPONSE_UPDATE_CONNECTION_ERROR: 'RESPONSE:UPDATE_CONNECTION_ERROR' as const,
  RESPONSE_CREATE_CONNECTION_SUCCESS: 'RESPONSE:CREATE_CONNECTION_SUCCESS' as const,
  RESPONSE_CREATE_CONNECTION_ERROR: 'RESPONSE:CREATE_CONNECTION_ERROR' as const,
  RESPONSE_TEST_CONNECTION_WARNING: 'RESPONSE:TEST_CONNECTION_WARNING' as const,
  RESPONSE_TEST_CONNECTION_SUCCESS: 'RESPONSE:TEST_CONNECTION_SUCCESS' as const,
  RESPONSE_TEST_CONNECTION_ERROR: 'RESPONSE:TEST_CONNECTION_ERROR' as const,
} as const;
