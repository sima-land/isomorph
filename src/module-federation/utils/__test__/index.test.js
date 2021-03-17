const { createExternalConfig } = require('../index');

describe('createExternalConfig', () => {
  it('should create correct config script', () => {
    expect(createExternalConfig(
      'service-name',
      'remote-entries',
      'containers'
    )).toEqual(['promise new Promise((resolve, reject) => {',
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
});
