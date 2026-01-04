import type { ReactNode } from "react";
import { Heading } from "./heading";

const ListItem = ({ children }: { children: ReactNode }) => (
  <li className=" grid col-span-full grid-cols-subgrid  ">{children}</li>
);
const Marker = ({ children }: { children: string }) => (
  <span className="bg-red-700 font-bold text-center text-white rounded-full aspect-square h-6 ">
    {children}
  </span>
);

const RuleList = () => {
  return (
    <>
      <Heading className=" mb-4 ">餅つきの遊び方</Heading>
      <ol className="mb-12 bg-gray-50 p-6 grid grid-cols-[auto_1fr] gap-y-6 gap-x-4">
        <ListItem>
          <Marker>1</Marker>
          <p className=" font-bold">つき手と合いの手に分かれます。</p>
        </ListItem>

        <ListItem>
          <Marker>2</Marker>
          <p className=" font-bold">つき手からスタート。</p>
        </ListItem>

        <ListItem>
          <Marker>3</Marker>
          <div className="flex-1">
            <p className="font-bold mb-2 ">
              つき手と合いの手を交互に繰り返します
            </p>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
              <dt className="text-blue-700 font-bold text-sm rounded-full bg-blue-100 w-max px-2.5 ">
                つき手
              </dt>
              <dd className="text-gray-700 ">タップで餅をつく</dd>

              <dt className="text-yellow-700 font-bold text-sm rounded-full bg-yellow-100 w-max px-2.5 ">
                合いの手
              </dt>
              <dd className="text-gray-700">
                長押しで
                <wbr />
                餅を返す
              </dd>
            </dl>
          </div>
        </ListItem>

        <ListItem>
          <Marker>4</Marker>
          <p className=" font-bold">30回でつきおわり</p>
        </ListItem>
      </ol>
    </>
  );
};

export default RuleList;
