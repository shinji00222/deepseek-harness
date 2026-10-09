import { delimiter } from 'node:path'
import { expect, it } from 'vitest'
import { desktopNodeEnvironment } from '../src/node-environment.ts'

it('keeps private Desktop launchers out of the Host environment inherited by PTC', () => {
  const environment = { PATH: '/user/bin', HOME: '/user' }
  expect(desktopNodeEnvironment('/desktop/electron', undefined, environment, 'linux')).toEqual({
    ...environment, ELECTRON_RUN_AS_NODE: '1',
  })
  expect(environment).toEqual({ PATH: '/user/bin', HOME: '/user' })
})

it('provides private launchers only to package installation processes', () => {
  expect(desktopNodeEnvironment('/desktop/electron', '/desktop/bin', { PATH: '/user/bin' }, 'linux')).toEqual({
    ELECTRON_RUN_AS_NODE: '1',
    DSH_DESKTOP_NODE_EXECUTABLE: '/desktop/electron',
    PATH: `/desktop/bin${delimiter}/user/bin`,
  })
})

it('adds Windows system certificate authorities to the Host without replacing existing Node options', () => {
  const environment = { NODE_OPTIONS: '--max-old-space-size=512', PATH: '/user/bin' }
  expect(desktopNodeEnvironment('/desktop/electron', undefined, environment, 'win32')).toEqual({
    ...environment,
    ELECTRON_RUN_AS_NODE: '1',
    NODE_OPTIONS: '--max-old-space-size=512 --use-system-ca',
  })
  expect(environment).toEqual({ NODE_OPTIONS: '--max-old-space-size=512', PATH: '/user/bin' })
})

it('does not duplicate or add the Windows certificate option on other platforms', () => {
  expect(desktopNodeEnvironment('/desktop/electron', undefined, { NODE_OPTIONS: '--use-system-ca' }, 'win32'))
    .toEqual({ NODE_OPTIONS: '--use-system-ca', ELECTRON_RUN_AS_NODE: '1' })
  expect(desktopNodeEnvironment('/desktop/electron', undefined, { PATH: '/user/bin' }, 'linux'))
    .toEqual({ PATH: '/user/bin', ELECTRON_RUN_AS_NODE: '1' })
})
