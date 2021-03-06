const { createExternalConfig } = require('../index');

describe('createExternalConfig', () => {
  it('should create correct config script', () => {
    expect(createExternalConfig({
      serviceName: 'service-name',
      remoteEntriesGlobalKey: 'remote-entries',
      containersGlobalKey: 'containers',
    })).toEqual(['promise new Promise((resolve, reject) => {',
      '  if (window[\'remote-entries\']) {',
      '    const scriptElement = document.createElement(\'script\');',
      '    scriptElement.onload = () => {',
      '      scriptElement.remove();',
      '      resolve(window[\'containers\'][\'service-name\']);',
      '    };',
      '    scriptElement.onerror = () => {',
      '      scriptElement.remove();',
      '      reject(new Error(\'Failed loading remoteEntry for "service-name".\'));',
      '    };',
      '    scriptElement.src = window[\'remote-entries\'][\'service-name\'];',
      '    scriptElement.async = true;',
      '    document.head.append(scriptElement);',
      '  } else {',
      '    reject(new ReferenceError(\'Object "remote-entries" unavailable.\'));',
      '  }',
      '})'].join('\n'));
  });

  it('should create correct config script for known remoteEntry', () => {
    expect(createExternalConfig({
      serviceName: 'service-name',
      remoteEntriesGlobalKey: 'remote-entries',
      containersGlobalKey: 'containers',
      remoteEntryPath: '//path/to/remoteEntry.js',
    })).toEqual(['promise new Promise((resolve, reject) => {',
      '  if (window[\'remote-entries\']) {',
      '    const scriptElement = document.createElement(\'script\');',
      '    scriptElement.onload = () => {',
      '      scriptElement.remove();',
      '      resolve(window[\'containers\'][\'service-name\']);',
      '    };',
      '    scriptElement.onerror = () => {',
      '      scriptElement.remove();',
      '      reject(new Error(\'Failed loading remoteEntry for "service-name".\'));',
      '    };',
      '    scriptElement.src = \'//path/to/remoteEntry.js\';',
      '    scriptElement.async = true;',
      '    document.head.append(scriptElement);',
      '  } else {',
      '    reject(new ReferenceError(\'Object "remote-entries" unavailable.\'));',
      '  }',
      '})'].join('\n'));
  });
});
