import { Functions, Objects, Types } from "@stnekroman/tstools";
import { InjectorError } from "./InjectorError";
import { getInversityMethodMetadata } from './metadata';
import { TokenType } from "./TokenType";

interface TokenMetadata<T> {
  type: TokenType;
  tags ?: string[];
  provider : {
    class ?: Types.Newable<T>;
    factory ?: Functions.ArgsFunction<unknown[], T>;
    dependencies ?: unknown[];
    value ?: T
  }
}

export class Injector {

  public static readonly root = new Injector();
  private static currentInjector : Injector;
  public static getCurrentInjector() : Injector {
    if (Injector.currentInjector) {
      return Injector.currentInjector;
    } else {
      //throw new Error("default injector call!");
      return Injector.root;
    }
  }

  private readonly metadatas = new Map<unknown, TokenMetadata<unknown>>();
  private readonly instances = new Map<unknown, unknown>();

  constructor(private readonly parent ?: Injector) {}

  public register<T>(token : unknown, metadata : TokenMetadata<T>) {
    this.metadatas.set(token, metadata);
  }

  public get<T>(token: Types.Newable<T> | Functions.ArgsFunction<unknown[], T> | T) : T {
    let instance = this.instances.get(token) as T;
    if (instance !== undefined) {
      return instance;
    }
    let metadata = this.metadatas.get(token) as TokenMetadata<T>;
    if (metadata === undefined && this.parent) {
      return this.parent.get<T>(token);
    }
    if (metadata !== undefined) {
      instance = this.instantiateFromMetadata(metadata);
      this.instances.set(token, instance);
      return instance;
    }

    const tokenName = Objects.isFunction(token) ? token.name : (token as any).toString();
    throw new InjectorError(`Unable instantiate token ${tokenName} - missing definition.`);
  }

  public getAll<R extends unknown[]>(tokens : unknown[]) : R {
    return tokens.map(t => this.get(t)) as R;
  }

  public instantiateFromMetadata<T>(metadata : TokenMetadata<T>) : T {
    switch (metadata.type) {
      case TokenType.CLASS:
        return this.createInstance(metadata.provider.class!, metadata.type);
      case TokenType.FACTORY:
        return this.createInstance(metadata.provider.factory!, metadata.type, metadata.provider.dependencies);
      case TokenType.VALUE:
      default:
        return metadata.provider.value!;
    }
  }

  public createInstance<T>(constructor : Types.Newable<T>) : T;
  public createInstance<T>(constructor : Types.Newable<T>, type : TokenType.CLASS) : T;
  public createInstance<T>(factory : Functions.ArgsFunction<unknown[], T>, type : TokenType.FACTORY, dependencies?: unknown[]) : T;
  createInstance<T>(
    constructorOrFactory : Types.Newable<T> | Functions.ArgsFunction<unknown[], T>,
    type : TokenType.CLASS | TokenType.FACTORY = TokenType.CLASS,
    dependencies?: unknown[]
  ) : T {
    const parameterTokens = dependencies ?? this.collectDependencies(constructorOrFactory);
    const parameters = this.getAll(parameterTokens);

    if (type === TokenType.CLASS) {
      return new (constructorOrFactory as Types.Newable<T>)(...parameters);
    } else {
      return (constructorOrFactory as Functions.ArgsFunction<unknown[], T>)(...parameters);
    }
  }
  
  private collectDependencies<T>(constructorOrFactory: Types.Newable<T> | Functions.ArgsFunction<unknown[], T>) : unknown[] {
    const methodMetadata = getInversityMethodMetadata(constructorOrFactory);
    return methodMetadata?.parameters ?? [];
  }

  public runInContext<R>(fn : Functions.Provider<R>) : R {
    const prevInjector = Injector.getCurrentInjector();
    Injector.currentInjector = this;
    try {
      return fn();
    } catch (e) {
      throw e;
    } finally {
      Injector.currentInjector = prevInjector;
    }
  }
}
