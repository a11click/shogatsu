interface MochiBase {
  status: "initial" | "pounded" | "turning" | "failed_turn" | "turned";
}

interface InitialMochi extends MochiBase {
  status: "initial";
}

interface StartedMochiBase extends MochiBase {
  start: number;
  count: number;
}

interface PoundedMochi extends StartedMochiBase {
  status: "pounded";
}

interface TurningMochi extends StartedMochiBase {
  status: "turning";
  turnStart: number;
}

interface FailedTurnMochi extends StartedMochiBase {
  status: "failed_turn";
}

interface TurnedMochi extends StartedMochiBase {
  status: "turned";
}

type StartedMochi = PoundedMochi | TurningMochi | FailedTurnMochi | TurnedMochi;
export type Mochi = InitialMochi | StartedMochi;

export type ActionResult =
  | {
      isOk: true;
      mochi: StartedMochi;
    }
  | {
      isOk: false;
    };

export type MochitsukiActionFunc = (mochi: Mochi, now: number) => ActionResult;

export const initializeMochi = (): InitialMochi => ({
  status: "initial",
});

const startedMochi = (now: number): PoundedMochi => ({
  start: now,
  count: 1,
  status: "pounded",
});

const poundedMochi = (mochi: TurnedMochi): PoundedMochi => {
  return {
    ...mochi,
    count: mochi.count + 1,
    status: "pounded",
  };
};

export const poundMochi: MochitsukiActionFunc = (mochi, now) => {
  if (mochi.status !== "initial" && mochi.status !== "turned") {
    return { isOk: false };
  }

  if (mochi.status === "initial") {
    return { isOk: true, mochi: startedMochi(now) };
  }

  return { isOk: true, mochi: poundedMochi(mochi) };
};

const TurningMochi = (
  mochi: PoundedMochi | FailedTurnMochi,
  now: number,
): TurningMochi => ({
  ...mochi,
  status: "turning",
  turnStart: now,
});

export const turnStartMochi: MochitsukiActionFunc = (mochi, now) => {
  if (mochi.status !== "pounded" && mochi.status !== "failed_turn") {
    return { isOk: false };
  }

  return { isOk: true, mochi: TurningMochi(mochi, now) };
};

const turnedMochi = (mochi: TurningMochi): TurnedMochi => {
  const { turnStart: _, ...m } = mochi;

  return {
    ...m,
    status: "turned",
    count: mochi.count + 1,
  };
};

const failedTurnMochi = (mochi: TurningMochi): FailedTurnMochi => {
  const { turnStart: _, ...m } = mochi;

  return {
    ...m,
    status: "failed_turn",
  };
};

const REQUIRED_TURN_DURATION = 500;

export const turnEndMochi: MochitsukiActionFunc = (mochi, now) => {
  if (mochi.status === "initial") {
    return { isOk: false };
  }

  if (mochi.status !== "turning") {
    return { isOk: true, mochi: mochi };
  }

  const duration = now - mochi.turnStart;
  const isSuccess = duration >= REQUIRED_TURN_DURATION;

  if (!isSuccess) {
    return { isOk: true, mochi: failedTurnMochi(mochi) };
  }

  return { isOk: true, mochi: turnedMochi(mochi) };
};
