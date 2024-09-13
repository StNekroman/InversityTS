import { Injector } from "../Injector";
import { ScopeProvider } from "./ScopeProvider";

export class SingletonScopeProvider<T> extends ScopeProvider<T> {

  private instance ?: T;

  public override get(injector: Injector) : T {
    if (!this.instance) {
      this.instance = this.metadata.instantiate(injector);
    }
    return this.instance;
  }
}
