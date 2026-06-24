import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/format";

export default function StatusBadge({ status, className = "" }) {
    const meta = statusMeta(status);
    return (
        <span
            data-testid={`status-badge-${status}`}
            className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em]",
                meta.classes,
                className
            )}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {meta.label}
        </span>
    );
}
