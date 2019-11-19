export const data = {
  id: 500,
  trademark: {},
  notices_text_all: ['text', 'text'],
  files: [
    {
      filename: 'test_1.pdf',
      title: 'Тест-1',
      size: 13,
      url: 'https://test-1.pgf',
    },
    {
      filename: 'test_2.pdf',
      title: 'Тест-2',
      size: 31,
      url: 'https://test-2.pgf',
    },
  ],
  modifier: {
    isPicture: false,
  },
};

export const error = {
  message: 'Error message',
};

export const errorWithConfig = {
  message: 'Error message',
  config: {
    url: 'test-error-url',
  },
};

export const errorWithResponse = {
  message: 'Error message',
  response: {
    status: 500,
    data: {
      test: 'test',
    },
    headers: {
      test: 'test',
    },
    config: {
      test: 'test',
    },
  },
};
