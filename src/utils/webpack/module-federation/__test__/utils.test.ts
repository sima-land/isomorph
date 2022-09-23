import { createExternalConfig, DEFAULT_SHARED } from '../utils';

describe('createExternalConfig', () => {
  it('should match reference', () => {
    expect(
      createExternalConfig({
        serviceName: 'example',
        containersGlobalKey: 'container_key',
        remoteEntriesGlobalKey: 'entries_key',
      }),
    ).toMatchSnapshot();

    expect(
      createExternalConfig({
        serviceName: 'example',
        containersGlobalKey: 'container_key',
        remoteEntriesGlobalKey: 'entries_key',
        remoteEntryPath: 'path/to/cdn/example/1.0.0/remoteEntry.hash.js',
      }),
    ).toMatchSnapshot();
  });
});

describe('DEFAULT_SHARED', () => {
  it('should match reference', () => {
    expect(DEFAULT_SHARED).toMatchSnapshot();
  });
});
