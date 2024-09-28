export interface UDocument<T> {
  id: string;
  data: T;
  active: boolean;
  timestamp: number;
  utimestamp: number;
}
