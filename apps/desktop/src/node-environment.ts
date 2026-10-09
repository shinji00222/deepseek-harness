/** Electron Node-mode startup, with private shell launchers scoped to package installation. */

import { delimiter } from 'node:path'

/**
 * Select Electron's Node mode and the shell launcher used by package scripts.
 * @param executable - Electron executable running the application.
 * @param bin - Directory containing the node shell launcher.
 * @param environment - Caller environment preserved for plugin execution.
 * @param platform - Platform whose system certificate behavior applies.
 * @returns Environment for a Node-mode child process.
 */
export function desktopNodeEnvironment(
  executable: string,
  bin: string | undefined,
  environment: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): NodeJS.ProcessEnv {
  const existingNodeOptions = environment.NODE_OPTIONS
  const needsSystemCa = platform === 'win32' && !existingNodeOptions?.split(/\s+/u).includes('--use-system-ca')
  const nodeOptions = `${existingNodeOptions ?? ''}${existingNodeOptions?.trim() ? ' ' : ''}--use-system-ca`
  return {
    ...environment,
    ELECTRON_RUN_AS_NODE: '1',
    ...needsSystemCa ? { NODE_OPTIONS: nodeOptions } : {},
    ...(bin === undefined ? {} : { DSH_DESKTOP_NODE_EXECUTABLE: executable, PATH: `${bin}${delimiter}${environment.PATH ?? ''}` }),
  }
}
