import { Injector } from "../Injector";
import { ScopeProvider } from "./ScopeProvider";

export class PrototypeScopeProvider<T> extends ScopeProvider<T> {

  public override get(injector: Injector) : T {
    return this.metadata.instantiate(injector);
  }
}
