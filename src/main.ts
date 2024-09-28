import { ACTION, ERROR, TASK, TASKRESULT } from "./constant";
import { db } from "./firebase";
import { UDocument } from "./types/firebase";
import { execute } from "./terminal";
import { UAction, UTask, UTaskType } from "./types/task";
import { schedule, unschedule } from "./cron";
import { getData, getError } from "./common";
import "dotenv/config";

let unsubscribeListener = () => {};
let unsubscribeAListener = () => {};

const instantExecute = async (script: UDocument<UTask>) => {
  const [stdout, stderr] = await execute(script.data.command).catch(
    async ([err, stdout, stderr]) => {
      await db
        .collection(ERROR)
        .add(getError(JSON.stringify(err), stdout, stderr, script.id));
      const uData = { utimestamp: Date.now(), active: false };
      await db.collection(TASK).doc(script.id).update(uData);
      return [] as [];
    }
  );
  if (stdout == undefined || stderr == undefined) return;
  const data = getData(script.id, script.data.type, stdout, stderr);
  await db.collection(TASKRESULT).add(data);
  const uData = { utimestamp: Date.now(), active: false };
  await db.collection(TASK).doc(script.id).update(uData);
};

const cronExecute = async (script: UDocument<UTask>) => {
  if (script.data.cronStatus) schedule(script);
  else unschedule(script);

  const uData = { utimestamp: Date.now(), active: false };
  await db.collection(TASK).doc(script.id).update(uData);
};

const startup = async () => {
  const querySnapshot = await db
    .collection(TASK)
    .where("active", "==", true)
    .where("data.type", "==", UTaskType.START)
    .orderBy("timestamp", "desc")
    .get();

  for (let index = 0; index < querySnapshot.docs.length; index++) {
    console.log(querySnapshot.docs[index].id);
    const snapshot = querySnapshot.docs[index];
    const script = { ...snapshot.data(), id: snapshot.id } as UDocument<UTask>;
    instantExecute(script);
  }
};

const taskListener = async () => {
  unsubscribeListener = db
    .collection(TASK)
    .where("active", "==", true)
    .where("data.type", "!=", UTaskType.START)
    .orderBy("timestamp", "desc")
    .onSnapshot(async (querySnapshot) => {
      for (let index = 0; index < querySnapshot.docs.length; index++) {
        console.log(querySnapshot.docs[index].id);
        const snapshot = querySnapshot.docs[index];
        const script = {
          ...snapshot.data(),
          id: snapshot.id,
        } as UDocument<UTask>;
        if (script.data.type == UTaskType.INSTANT) instantExecute(script);
        else if (script.data.type == UTaskType.CRON) cronExecute(script);
      }
    });
};
const actionListener = async () => {
  unsubscribeAListener = db
    .collection(ACTION)
    .orderBy("timestamp", "desc")
    .onSnapshot(async (querySnapshot) => {
      for (let index = 0; index < querySnapshot.docs.length; index++) {
        console.log(querySnapshot.docs[index].id);
        const snapshot = querySnapshot.docs[index];
        const action = {
          ...snapshot.data(),
          id: snapshot.id,
        } as UDocument<UAction>;
        await db.collection(ACTION).doc(snapshot.id).delete();
        if (action.data.name == "stop") stop();
      }
    });
};

const cronDisabler = async () => {
  db.collection(TASK)
    .where("data.type", "==", UTaskType.CRON)
    .orderBy("timestamp", "desc")
    .onSnapshot(async (querySnapshot) => {
      for (let index = 0; index < querySnapshot.docs.length; index++) {
        const snapshot = querySnapshot.docs[index];
        await db.collection(TASK).doc(snapshot.id).update({
          utimestamp: Date.now(),
          active: true,
          "data.cronStatus": true,
        });
      }
    });
};

const stop = async (err?: any) => {
  unsubscribeListener();
  unsubscribeAListener();
  if (err) {
    const error = getError(JSON.stringify(err), "", "");
    await db.collection(ERROR).add(error);
  }
  await cronDisabler();
  process.exit(err ? 1 : 0); // if exit with error reload with bash
};

(async () => {
  await startup();
  actionListener();
  taskListener();
})();
