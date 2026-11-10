'use client';

export default function Error({ error, reset }) {
  return (
    <div className="container-site py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold">This page did not load</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-700">
        The news service may be restarting. Try again in a moment.
      </p>
      {process.env.NODE_ENV !== 'production' && error?.message && (
        <p className="mx-auto mt-4 max-w-lg rounded bg-mist p-3 font-mono text-xs text-muted">{error.message}</p>
      )}
      <button onClick={reset} className="btn-primary mt-8">Try again</button>
    </div>
  );
}
