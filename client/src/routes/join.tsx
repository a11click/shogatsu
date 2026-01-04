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
            className="w-full bg-red-700 text-white min-h-11 font-bold hover:bg-red-600 rounded-full text-xl mb-4"
          >
            {isSubmitting ? "参加中..." : "参加する"}
          </button>
          <Link
            to="/"
            className="w-full bg-gray-300 min-h-11 font-bold rounded-full text-xl mb-4 flex items-center justify-center"
          >
            トップに戻る
          </Link>
        </Form>
      </div>
    </Main>
  );
};

export default JoinPage;
