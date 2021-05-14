import React from 'react';

export interface Props {
  children: NonNullable<React.ReactNode> | null
  fallback: NonNullable<React.ReactNode> | null
  captureException?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Обработчик ошибок в React компонентах.
 */
export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  /**
   * @param props Свойства компонента.
   * @param props.children Дочерний компонент.
   * @param props.fallback Запасной элемент, если возникла ошибка.
   * @param props.captureException Функция для логирования ошибки.
   */
  constructor (props: Props) {
    super(props);

    this.state = { hasError: false };
  }

  /** @inheritdoc */
  static getDerivedStateFromError () {
    return { hasError: true };
  }

  /** @inheritdoc */
  componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
    const { captureException } = this.props;

    captureException?.(error, errorInfo);
  }

  /**
   * Рендер.
   * @return Дочерний элемент либо запасное значение.
   */
  render () {
    const { children, fallback } = this.props;

    return this.state.hasError ? fallback : children;
  }
}

/**
 * Обертка над Suspense c перехватом ошибок.
 * @param props Свойства компонента.
 * @param props.children Дочерний компонент.
 * @param props.fallback Запасной элемент, если возникла ошибка.
 * @param props.captureException Функция для логирования ошибки.
 * @return Элемент.
 */
export const SafeSuspense = ({
  children,
  fallback,
  captureException,
}: Props) => (
  <React.Suspense fallback={fallback}>
    <ErrorBoundary
      children={children}
      fallback={fallback}
      captureException={captureException}
    />
  </React.Suspense>
);
