import { parseResponse } from "hono/client";
import { Form, Link, redirect, useNavigation } from "react-router";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { client } from "../hc";
import RuleList from "../components/rule-list";
import Main from "../components/main";
import { Heading } from "../components/heading";
import { PrimaryButton } from "../components/button";

export const loader = ({ params }: LoaderFunctionArgs) => {
  const code = params.roomId;
  if (!code) {
    throw redirect("/");
  }

  return;
};

export const action = async ({ params }: ActionFunctionArgs) => {
  const code = params.roomId;
  if (!code) return redirect("/");

  try {
    await parseResponse(
      client.api.rooms[":roomId"].guest.$post({ param: { roomId: code } }),
    );

    return redirect(`/play`);
  } catch (error) {
    return null;
  }
};

const JoinPage = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Main>
      <div className="w-full">
        <RuleList />
        <Heading className="mb-4">ルームに参加する</Heading>
        <Form method="post">
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="mb-4 transition-transform duration-200 ease-out hover:scale-105"
          >
            {isSubmitting ? "参加中..." : "参加する"}
          </PrimaryButton>
          <Link
            to="/"
            className="mb-4 flex min-h-11 w-full items-center justify-center rounded-full bg-gray-300 text-xl font-bold transition-transform duration-200 ease-out hover:scale-105"
          >
            トップに戻る
          </Link>
        </Form>
      </div>
    </Main>
  );
};

export default JoinPage;
