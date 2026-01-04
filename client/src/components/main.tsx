import type { ComponentProps } from "react";

const Main = (props: Omit<ComponentProps<"div">, "className">) => (
  <div
    {...props}
    className="mx-auto flex min-h-dvh max-w-160 items-center justify-center px-6 md:shadow-2xl"
  />
);

export default Main;
