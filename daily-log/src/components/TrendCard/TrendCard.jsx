import { motion } from "framer-motion";

function TrendCard({ title, subtitle, rightSlot, children, className = "" }) {
  return (
    <motion.article
      className={`surface-card rounded-3xl p-6 ${className}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
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
    </motion.article>
  );
}

export default TrendCard;
