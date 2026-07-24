import { cn } from "@/lib/utils"

function AspectRatio({
  ratio,
  className,
  style,
  ...props
}) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{
        "--ratio": ratio,
        ...style,
      }}
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}

export { AspectRatio }
