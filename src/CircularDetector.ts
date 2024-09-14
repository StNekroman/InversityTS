import { CircularDependencyError } from "./CircularDependencyError";

export class CircularDetector {

  private readonly tokens = new Set<unknown>();

  constructor(another ?: CircularDetector) {
    if (another) {
      for (const token of another.tokens) {
        this.tokens.add(token);
      }
    }
  }

  public handleToken(token : unknown) {
    if (this.tokens.has(token)) {
      throw new CircularDependencyError(this.makeErrorMessage());
    }
    this.tokens.add(token);
  }

  private makeErrorMessage() : string {
    return Array.from(this.tokens).map(i => i!.toString()).join("  --> ");
  }
}