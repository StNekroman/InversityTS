import { Functions, Types } from "@stnekroman/tstools";
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
}