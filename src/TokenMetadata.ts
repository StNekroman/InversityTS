import { Functions, Objects, Types } from "@stnekroman/tstools";
import { CircularDetector } from "./CircularDetector";
import { ForwardRef } from "./ForwardRef";
import { Injector } from "./Injector";
import { InjectorError } from "./InjectorError";
import { WeakCachingScopeProvider } from "./scope";
import { CachingScopeProvider } from "./scope/CachingScopeProvider";
import { PrototypeScopeProvider } from "./scope/PrototypeScopeProvider";
import { ScopeProvider } from "./scope/ScopeProvider";
import { SingletonScopeProvider } from "./scope/SingletonScopeProvider";
import { Token, TokenType } from "./Token";
import { TokenProviderType } from "./TokenProviderType";

export interface ClassTokenProvider<T> {
  class : Types.Newable<T>;
}

export interface FactoryTokenProvider<T> {
  dependencies ?: (TokenType | Token)[];
  factory : Functions.ArgsFunction<unknown[], T>;
}

export interface ValueTokenProvider<T> {
  value : T;
}

export interface RedirectTokenProvider {
  redirect : TokenType;
}

export type TokenProvider<T> = ClassTokenProvider<T> | FactoryTokenProvider<T> | ValueTokenProvider<T> | RedirectTokenProvider;

export type TokenScope<T = unknown> = "singleton" | "prototype" | Functions.Provider<string> | Types.Newable<ScopeProvider<T>>;

export type TokenMetadataOpions<T> =  ({
  type: TokenProviderType.CLASS;
  provider: ClassTokenProvider<T>;
} | {
  type: TokenProviderType.FACTORY;
  provider: FactoryTokenProvider<T>;
} | {
  type: TokenProviderType.VALUE;
  provider: ValueTokenProvider<T>;
} | {
  type: TokenProviderType.REDIRECT;
  provider: RedirectTokenProvider;
}) & ({
  scope ?: TokenScope<T>;
} | {
  scope : Functions.Provider<string>;
  weak ?: boolean;
}) & {
  tags ?: string[];
  multi ?: boolean;
};


export class TokenMetadata<T> {
  private readonly options : TokenMetadataOpions<T>;
  
  private instanceProvider : ScopeProvider<T>;

  constructor(options : TokenMetadataOpions<T>) {
    this.options = options;

    options.scope ??= "singleton";
    if (Objects.isString(options.scope)) {
      switch (options.scope) {
        case "prototype":
          this.instanceProvider = new PrototypeScopeProvider(this);
          break;
        case "singleton":
        default:
          this.instanceProvider = new SingletonScopeProvider(this);
      }
    } else if (Objects.isFunction(options.scope)) {
      if (Objects.isConstructorOf<ScopeProvider<T>>(options.scope, ScopeProvider as Types.Newable<ScopeProvider<T>>)) {
        this.instanceProvider = new options.scope(this);
      } else if ((options as {
        scope : Functions.Provider<string>;
        weak ?: boolean;
      }).weak) {
        this.instanceProvider = new WeakCachingScopeProvider(this as TokenMetadata<T & WeakKey>, options.scope);
      } else {
        this.instanceProvider = new CachingScopeProvider(this, options.scope);
      }
    } else {
      throw new InjectorError("Unspported scope type receives: " + options.scope);
    }
  }

  public get multi() : boolean {
    return Boolean(this.options.multi);
  }

  public get(injector : Injector, circularDetector ?: CircularDetector) : T {
    return this.instanceProvider.get(() => this.instantiate(injector, circularDetector));
  }

  public instantiate(injector : Injector, circularDetector ?: CircularDetector) : T {
    switch (this.options.type) {
      case TokenProviderType.CLASS:
        return injector.createInstance(this.options.provider.class, {
          type: TokenProviderType.CLASS,
          circularDetector: circularDetector
        });
      case TokenProviderType.FACTORY:
        return injector.createInstance(this.options.provider.factory, {
          type: this.options.type,
          dependencies: this.options.provider.dependencies,
          circularDetector: circularDetector
        });
      case TokenProviderType.REDIRECT:
        const toWhat = this.options.provider.redirect instanceof ForwardRef ? this.options.provider.redirect.provider() : this.options.provider.redirect;
        return injector.get(toWhat, circularDetector);
      case TokenProviderType.VALUE:
      default:
        return this.options.provider.value;
    }
  }
}