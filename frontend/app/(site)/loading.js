export default function Loading() {
  return (
    <div className="container-site animate-pulse py-12" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-2/3 rounded bg-mist" />
      <div className="mt-4 h-5 w-1/2 rounded bg-mist" />
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="aspect-[16/10] rounded bg-mist" />
            <div className="mt-4 h-5 w-5/6 rounded bg-mist" />
            <div className="mt-2 h-5 w-2/3 rounded bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}
