import { Types } from "@stnekroman/tstools";
import { Injector } from "../Injector";
import { CONSTRUCTOR, getOrCreateInversityMethodMetadata, MethodMetadata } from '../metadata';


export interface Inject {
  Param() : (target: Object, propertyKey : string | symbol | undefined, parameterIndex : number) => void;
}

export function Inject<T>(token : Types.Newable<T>, injector = Injector.getCurrentInjector()) : T {
  return injector.get(token);
}

Inject.Param = <T extends {}>(token : T) => {
  return function <C extends {}>(target: any, propertyKey : keyof C | typeof CONSTRUCTOR | undefined, parameterIndex : number) {
    //propertyKey ??= CONSTRUCTOR;
    const methodMetadata : MethodMetadata = getOrCreateInversityMethodMetadata(propertyKey ? target[propertyKey] : target);
    methodMetadata.parameters[parameterIndex] = token;
  };
}
