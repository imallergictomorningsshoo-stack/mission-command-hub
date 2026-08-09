import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const gcsButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-signal text-signal-foreground shadow-[0_0_24px_-8px_var(--signal)] hover:brightness-110 hover:shadow-[0_0_32px_-6px_var(--signal)]",
        outline:
          "border border-border bg-panel/50 text-foreground hover:border-signal/40 hover:bg-signal/10 hover:text-signal",
        ghost: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        danger:
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function GcsButton({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof gcsButtonVariants>) {
  return <button className={cn(gcsButtonVariants({ variant, size }), className)} {...props} />;
}
