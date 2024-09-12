import { Functions } from "@stnekroman/tstools";

export class ForwardRef<T> {
  constructor(public readonly provider : Functions.Provider<T>) {}
}
