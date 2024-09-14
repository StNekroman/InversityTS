import { Arrays } from "@stnekroman/tstools";
import { CircularDependencyError } from "./CircularDependencyError";
import { Injector } from './Injector';
import { TokenType } from "./Token";

export class CircularDetector {

  private readonly tokens = new Set<TokenType>();

  constructor(private readonly injector : Injector, another ?: CircularDetector) {
    if (another) {
      for (const token of another.tokens) {
        this.tokens.add(token);
      }
    }
  }

  public handleToken(token : TokenType) {
    if (this.tokens.has(token)) {
      throw new CircularDependencyError(this.makeErrorMessage(token));
    }
    this.tokens.add(token);
  }

  private makeErrorMessage(lastToken : TokenType) : string {
    const tokens = Array.from(this.tokens);
    const filtered = Arrays.filterUntil(tokens.reverse(), t => t !== lastToken, true);
    filtered.reverse();
    filtered.push(lastToken);
    return "Circular dependency detected: [" + filtered.map(i => i.toString()).join("  --> ") + "] on " + this.injector;
  }
}