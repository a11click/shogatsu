import clsx from "clsx/lite";
import type { ComponentProps } from "react";

export const Button = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    {...props}
    className={clsx(
      "flex min-h-12 w-full items-center justify-center gap-x-2 rounded-full text-xl font-bold",
      className,
    )}
  />
);

export const PrimaryButton = ({
  className,
  ...props
}: ComponentProps<"button">) => (
  <Button
    {...props}
    className={clsx("bg-red-700 text-white hover:bg-red-600", className)}
  />
);
