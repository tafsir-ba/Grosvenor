import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/format";

export default function StatusBadge({ status, className = "" }) {
    const meta = statusMeta(status);
    return (
        <span
            data-testid={`status-badge-${status}`}
            className={cn(
                "inline-flex items-center rounded-sm border px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]",
                meta.classes,
                className
            )}
        >
            {meta.label}
        </span>
    );
}
