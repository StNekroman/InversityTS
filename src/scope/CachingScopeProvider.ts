import { Functions } from "@stnekroman/tstools";
import { Injector } from "../Injector";
import { TokenMetadata } from "../TokenMetadata";
import { ScopeProvider } from "./ScopeProvider";

export class CachingScopeProvider<T> extends ScopeProvider<T> {

  private readonly cache = new Map<string, T>();

  constructor(metadata : TokenMetadata<T>, private readonly cacheKeyProvider : Functions.Provider<string>) {
    super(metadata);
  }

  public override get(injector: Injector) : T {
    const cacheKey = this.cacheKeyProvider();
    let instance = this.cache.get(cacheKey);
    if (!instance) {
      instance = this.metadata.instantiate(injector);
      this.cache.set(cacheKey, instance); 
    }
    return instance;
  }
}
