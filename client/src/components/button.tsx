import clsx from "clsx/lite";
import type { ComponentProps } from "react";

export const Button = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    {...props}
    className={clsx(
      " font-bold text-xl min-h-12 flex gap-x-2 items-center justify-center w-full rounded-full",
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
    className={clsx("bg-red-700 hover:bg-red-600 text-white", className)}
  />
);
