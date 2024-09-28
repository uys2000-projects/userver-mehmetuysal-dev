export enum UTaskType {
  INSTANT,
  START,
  CRON,
}
export interface UTask {
  type: UTaskType;
  command: string;
  cronStatus: boolean;
  cronExpression: string;
}

export interface UTaskResult {
  id: string; // task id
  type: UTaskType;
  stdout: string;
  stderr: string;
}

export interface UError {
  id?: string;
  error: any;
  stdout: string;
  stderr: string;
}

export interface UAction {
  name: "reload" | "stop";
}
