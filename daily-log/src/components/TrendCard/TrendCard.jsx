function TrendCard({ title, subtitle, rightSlot, children }) {
  return (
    <article className="surface-card rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        {rightSlot}
      </div>

      <div className="mt-5">{children}</div>
    </article>
  );
}

export default TrendCard;
