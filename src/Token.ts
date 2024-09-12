export namespace Token {
  export interface TokenOptions {
    multi ?: boolean;
  }
}

export class Token<T = unknown> {
  
  public readonly multi : boolean;

  constructor(
    public readonly value : T,
    options ?: Token.TokenOptions
  ) {
    this.multi = Boolean(options?.multi);
  }
}