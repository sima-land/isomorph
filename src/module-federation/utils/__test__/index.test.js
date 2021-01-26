const { createExternalConfig } = require('../index');

describe('createExternalConfig', () => {
  it('should create correct config script', () => {
    expect(createExternalConfig(
      'service-name',
      'remote-entries',
      'containers'
    )).toEqual(['promise new Promise(resolve => {',
      '  if (window[\'remote-entries\']) {',
      '    const scriptElement = document.createElement(\'script\');',
      '    scriptElement.onload = () => {',
      '      scriptElement.remove();',
      '      resolve(window[\'containers\'][\'service-name\']);',
      '    };',
      '    scriptElement.src = window[\'remote-entries\'][\'service-name\'];',
      '    scriptElement.async = true;',
      '    document.head.append(scriptElement);',
      '  }',
      '})'].join('\n'));
  });
});
