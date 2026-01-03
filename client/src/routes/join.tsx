import { parseResponse } from "hono/client";
import { Form, Link, redirect, useNavigation } from "react-router";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { client } from "../hc";
import RuleList from "../components/rule-list";

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
    <div className="md:shadow-2xl max-w-160 mx-auto min-h-screen px-6 py-8 flex items-center justify-center">
      <div className="w-full">
        <RuleList />
        <h2 className="text-lg font-bold mb-4 text-center">ルームに参加する</h2>
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
    </div>
  );
};

export default JoinPage;
