// Presentational component mapping a step `status` string to a CSS tag class
// and rendering the status text.
export default function StatusTag({ status }) {
  // Determine CSS class based on status value
  const cls =
    status === "COMPLETED"
      ? "tag completed"
      : status === "IN_PROGRESS"
      ? "tag progress"
      : "tag notstarted";

  return <span className={cls}>{status}</span>;
}