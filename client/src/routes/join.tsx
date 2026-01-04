import { parseResponse } from "hono/client";
import { Form, Link, redirect, useNavigation } from "react-router";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { client } from "../hc";
import RuleList from "../components/rule-list";
import Main from "../components/main";
import { Heading } from "../components/heading";

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
    console.error(error);

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
          <button
            type="submit"
            disabled={isSubmitting}
            className="mb-4 min-h-11 w-full rounded-full bg-red-700 text-xl font-bold text-white hover:bg-red-600"
          >
            {isSubmitting ? "参加中..." : "参加する"}
          </button>
          <Link
            to="/"
            className="mb-4 flex min-h-11 w-full items-center justify-center rounded-full bg-gray-300 text-xl font-bold"
          >
            トップに戻る
          </Link>
        </Form>
      </div>
    </Main>
  );
};

export default JoinPage;
