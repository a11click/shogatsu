import type { ReactNode } from "react";
import { Heading } from "./heading";

const ListItem = ({ children }: { children: ReactNode }) => (
  <li className="col-span-full grid grid-cols-subgrid">{children}</li>
);
const Marker = ({ children }: { children: string }) => (
  <span className="aspect-square h-6 rounded-full bg-red-700 text-center font-bold text-white">
    {children}
  </span>
);

const RuleList = () => {
  return (
    <>
      <Heading className="mb-4">餅つきの遊び方</Heading>
      <ol className="mb-12 grid grid-cols-[auto_1fr] gap-x-4 gap-y-6 bg-gray-50 p-6">
        <ListItem>
          <Marker>1</Marker>
          <p className="font-bold">つき手と合いの手に分かれます。</p>
        </ListItem>

        <ListItem>
          <Marker>2</Marker>
          <p className="font-bold">つき手からスタート。</p>
        </ListItem>

        <ListItem>
          <Marker>3</Marker>
          <div className="flex-1">
            <p className="mb-2 font-bold">
              つき手と合いの手を交互に繰り返します
            </p>

            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
              <dt className="w-max rounded-full bg-blue-100 px-2.5 text-sm font-bold text-blue-700">
                つき手
              </dt>
              <dd className="text-gray-700">タップで餅をつく</dd>

              <dt className="w-max rounded-full bg-yellow-100 px-2.5 text-sm font-bold text-yellow-700">
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
          <p className="font-bold">30回でつきおわり</p>
        </ListItem>
      </ol>
    </>
  );
};

export default RuleList;
