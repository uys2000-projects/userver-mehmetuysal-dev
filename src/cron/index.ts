import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { UDocument } from "../types/firebase";
import { UTask, UTaskType } from "../types/task";
import { execute } from "../terminal";
import { db } from "../firebase";
import { TASKRESULT } from "../constant";
import { getData } from "../common";

let tasks: Record<string, ScheduledTask> = {};

const options = {
  scheduled: true,
  timezone: "Europe/Istanbul",
};

export const schedule = (script: UDocument<UTask>) => {
  tasks[script.id] = cron.schedule(
    script.data.cronExpression,
    () =>
      execute(script.data.command).then(([stdout, stderr]) => {
        const data = getData(script.id, UTaskType.CRON, stdout, stderr);
        db.collection(TASKRESULT).add(data);
      }),
    options
  );
};

export const unschedule = (script: UDocument<UTask>) => {
  tasks[script.id]?.stop();
};
