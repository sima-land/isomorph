import { Component, ErrorInfo, ReactNode, Suspense } from 'react';

/**
 * Опции компонентов ErrorBoundary и SafeSuspense.
 */
export interface Props {
  /** Дочерний элемент. */
  children: NonNullable<ReactNode> | null;

  /** Содержимое, которое будет выведено если возникла ошибка. */
  fallback: NonNullable<ReactNode> | null;

  /** Функция для логирования ошибок. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Компонент-предохранитель. Обработчик ошибок в React-компонентах.
 */
export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  /**
   * @param props Свойства.
   */
  constructor(props: Props) {
    super(props);

    this.state = { hasError: false };
  }

  /** @inheritDoc */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /** @inheritDoc */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // @todo добавить возможность брать onError из специального контекста (это упростит передачу из di-контейнера)
    const { onError } = this.props;

    onError?.(error, errorInfo);
  }

  /**
   * Рендер.
   * @return Дочерний элемент либо запасное значение.
   */
  render() {
    const { children, fallback } = this.props;

    return <>{this.state.hasError ? fallback : children}</>;
  }
}

/**
 * Обертка над Suspense c перехватом ошибок.
 * @todo Возможно этот компонент не нужен...
 * @param props Свойства.
 * @return Элемент.
 */
export function SafeSuspense({ children, fallback, onError }: Props) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={fallback} onError={onError}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}
