import { Functions } from "@stnekroman/tstools";
import { ScopeProvider } from "./ScopeProvider";

export class PrototypeScopeProvider<T> extends ScopeProvider<T> {

  public override get(createInstanceCallback : Functions.Provider<T>) : T {
    return createInstanceCallback();
  }
}
