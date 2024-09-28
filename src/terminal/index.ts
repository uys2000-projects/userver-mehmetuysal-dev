import { exec, type ExecException } from "child_process";
export const execute = (
  command: string
): Promise<[stdout: string, stderr: string]> =>
  new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        return reject([err, stdout, stderr] as [ExecException, string, string]);
      }
      return resolve([stdout, stderr] as [string, string]);
    });
  });
