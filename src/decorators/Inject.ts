import { Types } from "@stnekroman/tstools";
import { Injector } from "../Injector";
import { getOrCreateInversityMethodMetadata, MethodMetadata } from '../metadata';
import { Token } from "../Token";


export interface Inject {
  Param() : (target: Object, propertyKey : string | symbol | undefined, parameterIndex : number) => void;
}

export function Inject<T>(token : Types.Newable<T>, injector ?: Injector) : T;
export function Inject<T = unknown>(token : unknown, injector ?: Injector) : T;
export function Inject(token : unknown | Token, injector = Injector.getCurrentInjector()) : unknown {
  return injector.get(token);
}

Inject.Param = <T extends {}>(token : T, options ?: Token.TokenOptions) => {
  return function <C extends {}>(target: C, propertyKey : keyof C | undefined, parameterIndex : number) {
    const methodMetadata : MethodMetadata = getOrCreateInversityMethodMetadata(propertyKey ? target[propertyKey] : target);
    methodMetadata.parameters[parameterIndex] = new Token(token, options);
  };
}