import { Functions } from "@stnekroman/tstools";
import { TokenMetadata } from "../TokenMetadata";
import { ScopeProvider } from "./ScopeProvider";

export class CachingScopeProvider<T> extends ScopeProvider<T> {

  private readonly cache = new Map<string, T>();
  private readonly cacheKeyProvider : Functions.Provider<string>;

  constructor(metadata : TokenMetadata<T>,
              cacheKeyProvider : Functions.Provider<string>) {
    super(metadata);
    this.cacheKeyProvider = cacheKeyProvider;
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
