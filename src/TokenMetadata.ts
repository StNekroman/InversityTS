import { Functions, Types } from "@stnekroman/tstools";
import { ForwardRef } from "./ForwardRef";
import { Injector } from "./Injector";
import { TokenType } from "./TokenType";

export interface TokenProvider<T> {
  class ?: Types.Newable<T>;
  factory ?: Functions.ArgsFunction<unknown[], T>;
  dependencies ?: unknown[];
  value ?: T;
  redirect ?: unknown;
}

export type TokenScope = "singleton" | "prototype";

export interface TokenMetadataOpions<T> {
  type: TokenType;
  tags ?: string[];
  multi ?: boolean;
  scope ?: TokenScope;
  provider : TokenProvider<T>;
}

export class TokenMetadata<T> {
  public readonly type: TokenType;
  public readonly multi : boolean;
  public readonly scope : TokenScope;
  public readonly tags ?: string[];
  public readonly provider : TokenProvider<T>;

  private singletonInstance ?: T;

  constructor(options : TokenMetadataOpions<T>) {
    this.type = options.type;
    this.multi = Boolean(options.multi);
    this.tags = options.tags;
    this.provider = options.provider;
    this.scope = options.scope ?? "singleton";
  }

  public get(injector : Injector) : T {
    switch(this.scope) {
      case "singleton":
        if (!this.singletonInstance) {
          this.singletonInstance = this.instantiate(injector);
        }
        return this.singletonInstance;
      case "prototype":
      default:
        return this.instantiate(injector);
    }
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