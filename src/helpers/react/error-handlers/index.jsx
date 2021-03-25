import React from 'react';

/**
 * Обработчик ошибок в React компонентах.
 */
export class ErrorBoundary extends React.Component {
  /**
   * @param {Object} props Свойства компонента.
   * @param {import('react').ReactNode} props.children Дочерний компонент.
   * @param {import('react').ReactNode} props.fallback Запасной элемент, если возникла ошибка.
   * @param {Function} [props.captureException] Функция для логирования ошибки.
   */
  constructor (props) {
    super(props);
    this.state = { hasError: false };
  }

  /** @inheritdoc */
  static getDerivedStateFromError () {
    return { hasError: true };
  }

  /** @inheritdoc */
  componentDidCatch (error, errorInfo) {
    const { captureException } = this.props;
    captureException?.(error, errorInfo);
  }

  /**
   * Рендер.
   * @return {ReactElement} Дочерний элемент либо запасное значение.
   */
  render () {
    const {
      children,
      fallback,
    } = this.props;

    return this.state.hasError ? fallback : children;
  }
}

/**
 * Обертка над Suspense c перехватом ошибок.
 * @param {Object} props Свойства компонента.
 * @param {import('react').ReactNode} props.children Дочерний компонент.
 * @param {import('react').ReactNode} props.fallback Запасной элемент, если возникла ошибка.
 * @param {Function} [props.captureException] Функция для логирования ошибки.
 * @return {ReactElement} Элемент.
 */
export const SafeSuspense = ({
  children,
  fallback,
  captureException,
}) => (
  <React.Suspense fallback={fallback}>
    <ErrorBoundary
      children={children}
      fallback={fallback}
      captureException={captureException}
    />
  </React.Suspense>
);
