import { Functions } from "@stnekroman/tstools";
import { ScopeProvider } from "./ScopeProvider";

export class SingletonScopeProvider<T> extends ScopeProvider<T> {

  private instance ?: T;

  public override get(createInstanceCallback : Functions.Provider<T>) : T {
    if (!this.instance) {
      this.instance = createInstanceCallback();
    }
    return this.instance;
  }
}
