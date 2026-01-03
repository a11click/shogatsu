import { describe, expect, test } from "vitest";
import {
  initializeMochi,
  poundMochi,
  turnEndMochi,
  turnStartMochi,
} from "./mochi.js";

test("initializeMochi", () => {
  expect(initializeMochi()).toStrictEqual({
    status: "initial",
  });
});

describe("poundMochi", () => {
  const cases = [
    {
      name: "ok1",
      args: [
        {
          status: "initial",
        },
        1,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "pounded",
          count: 1,
          start: 1,
        },
      },
    },
    {
      name: "ok2",
      args: [
        {
          status: "turned",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "pounded",
          count: 2,
          start: 0,
        },
      },
    },
    {
      name: "false",
      args: [
        {
          status: "pounded",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: false,
      },
    },
    {
      name: "false",
      args: [
        {
          status: "turning",
          count: 1,
          start: 0,
          turnStart: 1,
        },
        0,
      ],
      expected: {
        isOk: false,
      },
    },
    {
      name: "false",
      args: [
        {
          status: "failed_turn",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: false,
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof poundMochi>;
    expected: ReturnType<typeof poundMochi>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [state, now] = args;
    expect(poundMochi(state, now)).toStrictEqual(expected);
  });
});

describe("turnStartMochi", () => {
  const cases = [
    {
      name: "1",
      args: [
        {
          status: "pounded",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
      },
    },
    {
      name: "failed-",
      args: [
        {
          status: "failed_turn",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
      },
    },
    {
      name: "false2",
      args: [
        {
          status: "turned",
          count: 2,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: false,
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof turnStartMochi>;
    expected: ReturnType<typeof turnStartMochi>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [state, now] = args;
    expect(turnStartMochi(state, now)).toStrictEqual(expected);
  });
});

describe("trunEndMochi", () => {
  const cases = [
    {
      name: "initial false",
      args: [
        {
          status: "initial",
        },
        500,
      ],
      expected: {
        isOk: false,
      },
    },
    {
      name: "ok",
      args: [
        {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
        500,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "turned",
          count: 2,
          start: 0,
        },
      },
    },
    {
      name: "ok1000",
      args: [
        {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
        1000,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "turned",
          count: 2,
          start: 0,
        },
      },
    },
    {
      name: "ok 1",
      args: [
        {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
        1,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "failed_turn",
          count: 1,
          start: 0,
        },
      },
    },
    {
      name: "ok 499",
      args: [
        {
          status: "turning",
          count: 1,
          turnStart: 0,
          start: 0,
        },
        499,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "failed_turn",
          count: 1,
          start: 0,
        },
      },
    },
    {
      name: "oktrue",
      args: [
        {
          status: "pounded",
          count: 1,
          start: 0,
        },
        0,
      ],
      expected: {
        isOk: true,
        mochi: {
          status: "pounded",
          count: 1,
          start: 0,
        },
      },
    },
  ] satisfies {
    name: string;
    args: Parameters<typeof turnEndMochi>;
    expected: ReturnType<typeof turnEndMochi>;
  }[];

  test.each(cases)("$name", ({ args, expected }) => {
    const [state, now] = args;
    expect(turnEndMochi(state, now)).toStrictEqual(expected);
  });
});
