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

export interface TokenMetadataOpions<T> {
  type: TokenType;
  tags ?: string[];
  multi ?: boolean;
  provider : TokenProvider<T>;
}

export class TokenMetadata<T> {
  public readonly type: TokenType;
  public readonly multi : boolean;
  public readonly tags ?: string[];
  public readonly provider : TokenProvider<T>;

  constructor(options : TokenMetadataOpions<T>) {
    this.type = options.type;
    this.multi = Boolean(options.multi);
    this.tags = options.tags;
    this.provider = options.provider;
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