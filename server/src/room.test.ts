import { describe, expect, test } from "vitest";
import {
  applyGameAction,
  checkRole,
  createRoom,
  playAgain,
  ready,
} from "./room.js";
import { poundMochi, turnEndMochi } from "./mochi.js";

test("createRoom", () => {
  expect(createRoom("1", "1")).toStrictEqual({
    id: "1",
    status: "open",
    players: {
      host: { id: "1", isConnected: true },
    },
  });
});

describe("ready", () => {
  const cases = [
    {
      name: "ok h",
      args: [
        {
          id: "1",
          status: "ready",
          round: 0,
          players: {
            host: { id: "1", isReady: false, isConnected: true },
            guest: { id: "2", isReady: false, isConnected: true },
          },
        },
        "host",
      ],
      expected: {
        id: "1",
        status: "ready",
        round: 0,
        players: {
          host: { id: "1", isReady: true, isConnected: true },
          guest: { id: "2", isReady: false, isConnected: true },
        },
      },
    },
    {
      name: "ok g",
      args: [
        {
          id: "1",
          status: "ready",
          round: 0,
          players: {
            host: { id: "1", isReady: false, isConnected: true },
            guest: { id: "2", isReady: false, isConnected: true },
          },
        },
        "guest",
      ],
      expected: {
        id: "1",
        status: "ready",
        round: 0,
        players: {
          host: { id: "1", isReady: false, isConnected: true },
          guest: { id: "2", isReady: true, isConnected: true },
        },
      },
    },
    {
      name: "okp",
      args: [
        {
          id: "1",
          status: "ready",
          round: 0,
          players: {
            host: { id: "1", isReady: true, isConnected: true },
            guest: { id: "2", isReady: false, isConnected: true },
          },
        },
        "guest",
      ],
      expected: {
        id: "1",
        status: "playing",
        round: 1,
        players: {
          host: { id: "1", isConnected: true },
          guest: { id: "2", isConnected: true },
        },
        mochi: {
          status: "initial",
        },
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof ready>;
    expected: ReturnType<typeof ready>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [room, role] = args;
    expect(ready(room, role)).toStrictEqual(expected);
  });
});

describe("applyGameAction", () => {
  const cases = [
    {
      name: "ok",
      args: [
        {
          id: "1",
          status: "playing",
          round: 1,
          players: {
            host: { id: "1", isConnected: true },
            guest: { id: "2", isConnected: true },
          },
          mochi: {
            status: "initial",
          },
        },

        0,
        poundMochi,
      ],
      expected: {
        id: "1",
        status: "playing",
        round: 1,
        players: {
          host: { id: "1", isConnected: true },
          guest: { id: "2", isConnected: true },
        },
        mochi: {
          status: "pounded",
          count: 1,
          start: 0,
        },
      },
    },
    {
      name: "finished",
      args: [
        {
          id: "1",
          status: "playing",
          round: 1,
          players: {
            host: { id: "1", isConnected: true },
            guest: { id: "2", isConnected: true },
          },
          mochi: {
            status: "turning",
            count: 29,
            turnStart: 0,
            start: 0,
          },
        },
        5000,
        turnEndMochi,
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: false, isConnected: true },
          guest: { id: "2", isPlayAgain: false, isConnected: true },
        },
        result: {
          isOk: true,
          time: 5000,
        },
        best: 5000,
      },
    },
    {
      name: "finished best5000",
      args: [
        {
          id: "1",
          status: "playing",
          round: 1,
          players: {
            host: { id: "1", isConnected: true },
            guest: { id: "2", isConnected: true },
          },
          mochi: {
            status: "turning",
            count: 29,
            turnStart: 0,
            start: 0,
          },
          best: 6000,
        },
        5000,
        turnEndMochi,
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: false, isConnected: true },
          guest: { id: "2", isPlayAgain: false, isConnected: true },
        },
        result: {
          isOk: true,
          time: 5000,
        },
        best: 5000,
      },
    },
    {
      name: "fail",
      args: [
        {
          id: "1",
          status: "playing",
          round: 1,
          players: {
            host: { id: "1", isConnected: true },
            guest: { id: "2", isConnected: true },
          },
          mochi: {
            status: "pounded",
            count: 1,
            start: 0,
          },
        },

        1,
        poundMochi,
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: false, isConnected: true },
          guest: { id: "2", isPlayAgain: false, isConnected: true },
        },
        result: {
          isOk: false,
        },
        best: undefined,
      },
    },
    {
      name: "fail b",
      args: [
        {
          id: "1",
          status: "playing",
          round: 1,
          players: {
            host: { id: "1", isConnected: true },
            guest: { id: "2", isConnected: true },
          },
          mochi: {
            status: "pounded",
            count: 1,
            start: 0,
          },
          best: 5000,
        },
        1,
        poundMochi,
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: false, isConnected: true },
          guest: { id: "2", isPlayAgain: false, isConnected: true },
        },
        result: {
          isOk: false,
        },
        best: 5000,
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof applyGameAction>;
    expected: ReturnType<typeof applyGameAction>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [room, role, now] = args;
    expect(applyGameAction(room, role, now)).toStrictEqual(expected);
  });
});

describe("playAgain", () => {
  const cases = [
    {
      name: "ok h",
      args: [
        {
          id: "1",
          status: "finished",
          round: 1,
          players: {
            host: { id: "1", isPlayAgain: false, isConnected: true },
            guest: { id: "2", isPlayAgain: false, isConnected: true },
          },
          result: {
            isOk: true,
            time: 5000,
          },
        },
        "host",
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: true, isConnected: true },
          guest: { id: "2", isPlayAgain: false, isConnected: true },
        },
        result: {
          isOk: true,
          time: 5000,
        },
      },
    },
    {
      name: "ok g",
      args: [
        {
          id: "1",
          status: "finished",
          round: 1,
          players: {
            host: { id: "1", isPlayAgain: false, isConnected: true },
            guest: { id: "2", isPlayAgain: false, isConnected: true },
          },
          result: {
            isOk: true,
            time: 5000,
          },
        },
        "guest",
      ],
      expected: {
        id: "1",
        status: "finished",
        round: 1,
        players: {
          host: { id: "1", isPlayAgain: false, isConnected: true },
          guest: { id: "2", isPlayAgain: true, isConnected: true },
        },
        result: {
          isOk: true,
          time: 5000,
        },
      },
    },
    {
      name: "ok ready",
      args: [
        {
          id: "1",
          status: "finished",
          round: 1,
          players: {
            host: { id: "1", isPlayAgain: true, isConnected: true },
            guest: { id: "2", isPlayAgain: false, isConnected: true },
          },
          result: {
            isOk: true,
            time: 5000,
          },
        },
        "guest",
      ],
      expected: {
        id: "1",
        status: "ready",
        round: 1,
        players: {
          host: { id: "1", isReady: false, isConnected: true },
          guest: { id: "2", isReady: false, isConnected: true },
        },
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof playAgain>;
    expected: ReturnType<typeof playAgain>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [room, role] = args;
    expect(playAgain(room, role)).toStrictEqual(expected);
  });
});

describe("checkRole", () => {
  const cases = [
    {
      args: [1, "host", "tsukite"],
      expected: true,
    },
    {
      args: [1, "host", "ainote"],
      expected: false,
    },
    {
      args: [1, "guest", "ainote"],
      expected: true,
    },
    {
      args: [1, "guest", "tsukite"],
      expected: false,
    },
    {
      args: [2, "host", "ainote"],
      expected: true,
    },
    {
      args: [2, "host", "tsukite"],
      expected: false,
    },
    {
      args: [2, "guest", "tsukite"],
      expected: true,
    },
    {
      args: [6, "guest", "ainote"],
      expected: false,
    },
  ] satisfies {
    args: Parameters<typeof checkRole>;
    expected: ReturnType<typeof checkRole>;
  }[];

  test.each(cases)(
    "round $args.0, $args.1 is $args.2 expected: $expected",
    ({ args, expected }) => {
      const [room, role, now] = args;
      expect(checkRole(room, role, now)).toStrictEqual(expected);
    },
  );
});
