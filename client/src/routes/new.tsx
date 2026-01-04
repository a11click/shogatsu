import { Form, redirect, useNavigation } from "react-router";

import { client } from "../hc";
import { parseResponse } from "hono/client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import RuleList from "../components/rule-list";
import { PrimaryButton } from "../components/button";
import Main from "../components/main";

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
    <Main>
      <div className="w-full">
        <h1 className="mb-8 text-center font-serif text-2xl font-bold">
          お正月餅つきタイムアタック
        </h1>

        <RuleList />

        <Form method="post" className="w-full">
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="transition-transform duration-200 ease-out hover:scale-105"
          >
            {isSubmitting ? "作成中..." : "ルームを作成"}
            <ArrowRightIcon className="size-6" />
          </PrimaryButton>
        </Form>
      </div>
    </Main>
  );
};

export default NewRoomPage;
