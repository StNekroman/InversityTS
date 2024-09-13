import { Injector } from "../Injector";
import { TokenMetadata } from "../TokenMetadata";

export abstract class ScopeProvider<T> {
  public abstract get(injector : Injector) : T;

  constructor(protected readonly metadata : TokenMetadata<T>) {}
}