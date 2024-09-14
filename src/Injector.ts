import { Functions, Objects, Types } from "@stnekroman/tstools";
import { CircularDetector } from "./CircularDetector";
import { InjectorError } from "./InjectorError";
import { getInversityMethodMetadata } from './metadata';
import { Token, TokenType } from './Token';
import { TokenMetadata, TokenMetadataOpions } from "./TokenMetadata";
import { TokenProviderType } from "./TokenProviderType";


export class Injector {

  public static readonly root = new Injector("root");
  private static currentInjector : Injector;
  public static getCurrentInjector() : Injector {
    return Injector.currentInjector ?? Injector.root;
  }

  private readonly metadataCache = new Map<TokenType, TokenMetadata<unknown>[]>();

  constructor(public readonly name : string, private readonly parent ?: Injector) {}

  public toString() {
    return "Injector[" + this.name + "]";
  }

  public register<T>(token : TokenType, options : TokenMetadataOpions<T>) {
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

  public get<T>(token: Token & {multi : false}, circularDetector ?: CircularDetector) : T;
  public get<T>(token: Token & {multi : true}, circularDetector ?: CircularDetector) : T[];
  public get<T>(token: TokenType, circularDetector ?: CircularDetector) : T;
  get<T>(token: TokenType | Token, circularDetector ?: CircularDetector) : T | T[] {
    let instances :  T[] | undefined;
    circularDetector ??= new CircularDetector(this);

    const isMultiple = Injector.isMultiToken(token);
    const tokenValue = Injector.getTokenValue(token);
    const metadatas = this.metadataCache.get(tokenValue) as TokenMetadata<T>[] | undefined;
    if (metadatas && metadatas.length > 0) {
      circularDetector.handleToken(tokenValue);
      instances = this.getInstancesFromMetadatas(metadatas, circularDetector);
    } else if (this.parent) {
      if (isMultiple) {
        instances = this.parent.get<T>(token, circularDetector);
      } else {
        instances = [this.parent.get<T>(token, circularDetector)];
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

  private static makeTokenName(token: TokenType | Token) : string {
    const tokenValue = Injector.getTokenValue(token);
    return Objects.isFunction(tokenValue) ? tokenValue.name : (tokenValue as any).toString();
  }

  private getInstancesFromMetadatas<T>(metadatas : TokenMetadata<T>[], circularDetector ?: CircularDetector) : T[] {
    if (metadatas.length === 1) {
      return [metadatas[0].get(this, circularDetector)];
    } else {
      return metadatas.map(metadata => metadata.get(this, new CircularDetector(this, circularDetector)));
    }
  }

  public getAll<R extends unknown[]>(tokens : (TokenType | Token)[], circularDetector ?: CircularDetector) : R {
    if (tokens.length === 1) {
      return [this.get(tokens[0], circularDetector)] as R;
    } else {
      return tokens.map(t => this.get(t, new CircularDetector(this, circularDetector))) as R;
    }
  }

  public createInstance<T>(constructor : Types.Newable<T>) : T;
  public createInstance<T>(constructor : Types.Newable<T>, options : { type : TokenProviderType.CLASS, circularDetector ?: CircularDetector }) : T;
  public createInstance<T>(factory : Functions.ArgsFunction<any[], T>, options : { type : TokenProviderType.FACTORY, dependencies?: (TokenType | Token)[], circularDetector ?: CircularDetector}) : T;
  createInstance<T>(
    constructorOrFactory : Types.Newable<T> | Functions.ArgsFunction<unknown[], T>,
    options ?: {
      type : TokenProviderType.CLASS | TokenProviderType.FACTORY,
      dependencies?: (TokenType | Token)[],
      circularDetector ?: CircularDetector
    }    
  ) : T {
    const type : TokenProviderType = options?.type ?? TokenProviderType.CLASS;
    const parameterTokens = options?.dependencies ?? this.collectDependencies(constructorOrFactory);
    const parameters = this.getAll(parameterTokens, options?.circularDetector);
    if (type === TokenProviderType.CLASS) {
      return new (constructorOrFactory as Types.Newable<T>)(...parameters);
    } else {
      return (constructorOrFactory as Functions.ArgsFunction<unknown[], T>)(...parameters);
    }
  }
  
  private collectDependencies<T>(constructorOrFactory: Types.Newable<T> | Functions.ArgsFunction<unknown[], T>) : (TokenType | Token)[] {
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

  private static isMultiToken(token : TokenType | Token & {multi: boolean}) : token is Token & {multi: true} {
    return token instanceof Token ? Boolean(token.multi) : false;
  }

  private static getTokenValue<T extends TokenType>(token : T | Token<T>) : T {
    return token instanceof Token ? token.value : token;
  }
}
