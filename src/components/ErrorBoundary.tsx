import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';
import useLanguage from '../hooks/useLanguage';

const CustomFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const {t} = useLanguage();
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-100">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-red-600 mb-4">{t("errorBoundaryTitle")}</h1>
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
            {t("errorBoundaryHeading")}
          </h2>
          <p className="text-gray-600 md:text-lg mb-2">
            {t("errorMessage")}
          </p>
          <p className="text-gray-500 text-sm">
            {t("retryInstruction")}
          </p>
        </div>
        <div>
          <button
            onClick={resetErrorBoundary}
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            {t("retryButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={CustomFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
