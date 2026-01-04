import clsx from "clsx";
import type { Mochi } from "server/src/mochi";
import React from "react";

const MochiImg: React.FC<{ mochi: Mochi }> = ({ mochi }) => {
  return (
    <img
      src="/mochi.png"
      alt=""
      className={clsx(
        "mx-auto w-1/3",
        mochi.status === "pounded" && "animate-squash-once",
        mochi.status === "turning" ? "rotate-180 duration-500" : "rotate-0",
      )}
    />
  );
};

export default MochiImg;
