import { Functions } from "@stnekroman/tstools";
import { Injector } from "../Injector";
import { TokenMetadata } from "../TokenMetadata";

export abstract class ScopeProvider<T> {
  constructor(protected readonly metadata : TokenMetadata<T>) {}

  public abstract get(createInstanceCallback : Functions.Provider<T>) : T;
}