import React from 'react';

export interface Props {
  /** Дочерний компонент. */
  children: NonNullable<React.ReactNode> | null;

  /** Запасной элемент, если возникла ошибка. */
  fallback: NonNullable<React.ReactNode> | null;

  /** Функция для логирования ошибки. */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Обработчик ошибок в React-компонентах.
 */
export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  /**
   * @param props Свойства.
   */
  constructor(props: Props) {
    super(props);

    this.state = { hasError: false };
  }

  /** @inheritdoc */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /** @inheritdoc */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;

    onError?.(error, errorInfo);
  }

  /**
   * Рендер.
   * @return Дочерний элемент либо запасное значение.
   */
  render() {
    const { children, fallback } = this.props;

    return this.state.hasError ? fallback : children;
  }
}

/**
 * Обертка над Suspense c перехватом ошибок.
 * @todo Возможно этот компонент не нужен...
 * @param props Свойства.
 * @return Элемент.
 */
export const SafeSuspense = ({ children, fallback, onError }: Props) => (
  <React.Suspense fallback={fallback}>
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  </React.Suspense>
);
