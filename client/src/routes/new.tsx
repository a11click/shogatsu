import { Form, redirect, useNavigation } from "react-router";

import { client } from "../hc";
import { parseResponse } from "hono/client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import RuleList from "../components/rule-list";
import { PrimaryButton } from "../components/button";

export const action = async () => {
  try {
    await parseResponse(client.api.rooms.$post({}));
    return redirect("/play");
  } catch {
    return redirect("/");
  }
};

const NewRoomPage = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-160 min-h-screen items-center justify-center flex w-full mx-auto px-4 border-x border-gray-300">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-center mb-8 font-serif">
          お正月餅つきタイムアタック
        </h1>

        <RuleList />

        <Form method="post" className="w-full">
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="bg-red-700 hover:bg-red-600 text-white font-bold text-xl min-h-12 flex gap-x-2 items-center justify-center w-full rounded-full"
          >
            {isSubmitting ? "作成中..." : "ルームを作成"}
            <ArrowRightIcon className="size-6" />
          </PrimaryButton>
        </Form>
      </div>
    </div>
  );
};

export default NewRoomPage;
