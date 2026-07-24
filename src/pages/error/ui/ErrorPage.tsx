import { useDocumentTitle } from '@/shared/lib';
import { ErrorState } from '@/shared/ui';

interface ErrorPageProps {
  title?: string;
  description?: string;
  showReload?: boolean;
  onRetry?: () => void;
}

export const ErrorPage = ({
  title = 'Что-то пошло не так',
  description = 'Попробуйте повторить действие или перезагрузить страницу',
  showReload = true,
  onRetry,
}: ErrorPageProps) => {
  useDocumentTitle(title);

  return (
    <ErrorState title={title} description={description} showReload={showReload} onRetry={onRetry} />
  );
};
