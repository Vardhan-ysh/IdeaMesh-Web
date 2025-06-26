import { cn } from "@/lib/utils";

export default function AppLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      {...props}
    >
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="6" strokeLinecap="round">
        <line x1="50" y1="25" x2="30" y2="75" />
        <line x1="50" y1="25" x2="70" y2="75" />
        <line x1="30" y1="75" x2="70" y2="75" />
      </g>
      <g fill="currentColor">
        <circle cx="50" cy="25" r="15" />
        <circle cx="30"cy="75" r="15" />
        <circle cx="70" cy="75" r="15" />
      </g>
    </svg>
  );
}
