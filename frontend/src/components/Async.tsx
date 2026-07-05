import type { UseQueryResult } from '@tanstack/react-query'
import { LoadingBlock } from './LoadingBlock'
import { ErrorBlock } from './ErrorBlock'

interface AsyncProps<T> {
  query: UseQueryResult<T>
  loadingLabel?: string
  loadingRows?: number
  children: (data: T) => React.ReactNode
}

// Every fetch on the dashboard routes through this so loading/error states
// are handled once instead of re-implemented per section.
export function Async<T>({ query, loadingLabel, loadingRows, children }: AsyncProps<T>) {
  if (query.isPending) {
    return <LoadingBlock label={loadingLabel} rows={loadingRows} />
  }
  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'unknown error'
    return <ErrorBlock message={message} />
  }
  return <>{children(query.data)}</>
}
