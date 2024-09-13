import { Functions, Objects, Types } from "@stnekroman/tstools";
import { ForwardRef } from "./ForwardRef";
import { Injector } from "./Injector";
import { InjectorError } from "./InjectorError";
import { TokenType } from "./TokenType";
import { CachingScopeProvider } from "./scope/CachingScopeProvider";
import { PrototypeScopeProvider } from "./scope/PrototypeScopeProvider";
import { ScopeProvider } from "./scope/ScopeProvider";
import { SingletonScopeProvider } from "./scope/SingletonScopeProvider";

export interface TokenProvider<T> {
  class ?: Types.Newable<T>;
  factory ?: Functions.ArgsFunction<unknown[], T>;
  dependencies ?: unknown[];
  value ?: T;
  redirect ?: unknown;
}

export type TokenScope<T = unknown> = "singleton" | "prototype" | Functions.Provider<string> | Types.Newable<ScopeProvider<T>>;

export interface TokenMetadataOpions<T> {
  type: TokenType;
  tags ?: string[];
  multi ?: boolean;
  scope ?: TokenScope<T>;
  provider : TokenProvider<T>;
}

export class TokenMetadata<T> {
  public readonly type: TokenType;
  public readonly multi : boolean;
  public readonly tags ?: string[];
  public readonly provider : TokenProvider<T>;
  
  private instanceProvider : ScopeProvider<T>;

  constructor(options : TokenMetadataOpions<T>) {
    this.type = options.type;
    this.multi = Boolean(options.multi);
    this.tags = options.tags;
    this.provider = options.provider;

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
      } else {
        this.instanceProvider = new CachingScopeProvider(this, options.scope);
      }
    } else {
      throw new InjectorError("Unspported scope type receives: " + options.scope);
    }
  }

  public get(injector : Injector) : T {
    return this.instanceProvider.get(injector);
  }

  public instantiate(injector : Injector) : T {
    switch (this.type) {
      case TokenType.CLASS:
        return injector.createInstance(this.provider.class!, this.type);
      case TokenType.FACTORY:
        return injector.createInstance(this.provider.factory!, this.type, this.provider.dependencies);
      case TokenType.REDIRECT:
        const toWhat = this.provider.redirect instanceof ForwardRef ? this.provider.redirect.provider() : this.provider.redirect;
        return injector.get(toWhat);
      case TokenType.VALUE:
      default:
        return this.provider.value!;
    }
  }
}