import { ReactNode, ErrorInfo, FC } from "react";

type Props = {
    children: NonNullable<ReactNode>|null,
    fallback: NonNullable<ReactNode>|null
    captureException?: (error: Error, errorInfo: ErrorInfo) => void,
}
export declare const ErrorBoundary: FC<Props>;
export declare const SafeSuspense: FC<Props>;