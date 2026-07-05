export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
      Failed to load: {message}
    </div>
  )
}
