export namespace Token {
  export interface TokenOptions {
    multi ?: boolean;
  }
}

export type TokenType = NonNullable<unknown>;

export class Token<T extends TokenType = TokenType> {
  
  public readonly multi : boolean;

  constructor(
    public readonly value : T,
    options ?: Token.TokenOptions
  ) {
    this.multi = Boolean(options?.multi);
  }
}