import { Functions, Objects, Types } from "@stnekroman/tstools";
import { InjectorError } from "./InjectorError";
import { getInversityMethodMetadata } from './metadata';
import { Token } from './Token';
import { TokenMetadata, TokenMetadataOpions } from "./TokenMetadata";
import { TokenType } from "./TokenType";


export class Injector {

  public static readonly root = new Injector();
  private static currentInjector : Injector;
  public static getCurrentInjector() : Injector {
    return Injector.currentInjector ?? Injector.root;
  }

  private readonly metadataCache = new Map<unknown, TokenMetadata<unknown>[]>();

  constructor(private readonly parent ?: Injector) {}

  public register<T>(token : NonNullable<unknown>, options : TokenMetadataOpions<T>) {
    const metadata = new TokenMetadata(options);
    if (!metadata.multi) {
      this.metadataCache.set(token, [metadata]);
    } else {
      let arr = this.metadataCache.get(token);
      if (arr === undefined) {
        arr = [];
        this.metadataCache.set(token, arr);
      }
      arr.push(metadata);
    }
  }

  public get<T>(token: Token & {multi : false}) : T;
  public get<T>(token: Token & {multi : true}) : T[];
  public get<T>(token: unknown) : T;
  get<T>(token: unknown | Token) : T | T[] {
    let instances :  T[] | undefined;

    const isMultiple = Injector.isMultiToken(token);
    const tokenValue = Injector.getTokenValue(token);
    const metadatas = this.metadataCache.get(tokenValue) as TokenMetadata<T>[] | undefined;
    if (metadatas && metadatas.length > 0) {
      instances = metadatas.map(metadata => metadata.get(this));
    } else if (this.parent) {
      if (isMultiple) {
        instances = this.parent.get<T>(token);
      } else {
        instances = [this.parent.get<T>(token)];
      }
    }

    if (instances && instances.length > 0) {
      if (isMultiple) {
        return instances;
      } else if (instances.length === 1) {
        return instances[0];
      } else {
        throw new InjectorError(`More than one inject candidats for token ${Injector.makeTokenName(token)}`);
      }
    }
    throw new InjectorError(`Unable instantiate token ${Injector.makeTokenName(token)} - missing definition.`);
  }

  private static makeTokenName(token: unknown | Token) : string {
    const tokenValue = Injector.getTokenValue(token);
    return Objects.isFunction(tokenValue) ? tokenValue.name : (tokenValue as any).toString();
  }

  public getAll<R extends unknown[]>(tokens : (unknown | Token)[]) : R {
    return tokens.map(t => this.get(t)) as R;
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
  
  private collectDependencies<T>(constructorOrFactory: Types.Newable<T> | Functions.ArgsFunction<unknown[], T>) : (unknown | Token)[] {
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

  private static isMultiToken(token : unknown | Token & {multi: boolean}) : token is Token & {multi: true} {
    return token instanceof Token ? Boolean(token.multi) : false;
  }

  private static getTokenValue<T = unknown>(token : T | Token<T>) : T {
    return token instanceof Token ? token.value : token;
  }
}
