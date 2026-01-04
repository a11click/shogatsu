import clsx from "clsx";
import type { ComponentProps } from "react";

export const Heading = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2 {...props} className={clsx("text-center text-lg font-bold", className)} />
);
