import { Functions } from "@stnekroman/tstools";
import { TokenMetadata } from "../TokenMetadata";
import { ScopeProvider } from "./ScopeProvider";

export class CachingScopeProvider<T> extends ScopeProvider<T> {

  private readonly cache = new Map<string, T>();

  constructor(metadata : TokenMetadata<T>, private readonly cacheKeyProvider : Functions.Provider<string>) {
    super(metadata);
  }

  public override get(createInstanceCallback : Functions.Provider<T>) : T {
    const cacheKey = this.cacheKeyProvider();
    let instance = this.cache.get(cacheKey);
    if (!instance) {
      instance = createInstanceCallback();
      this.cache.set(cacheKey, instance); 
    }
    return instance;
  }
}
