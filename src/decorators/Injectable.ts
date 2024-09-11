import { Functions, Objects, Types } from "@stnekroman/tstools";
import { Injector } from '../Injector';
import { InjectorError } from "../InjectorError";
import { getOrCreateInversityClassMetadata, InversityMetadata } from "../metadata";
import { TokenType } from "../TokenType";


export function Injectable<T>(token: T, options : {injector ?: Injector, tags ?: string[], class : Types.Newable}) : T;
export function Injectable<T,ARGS extends unknown[]>(token: T, options : {injector ?: Injector, tags ?: string[], factory : Functions.ArgsFunction<ARGS, unknown>, dependencies?: unknown[]}) : T;
export function Injectable<T>(token: T, options : {injector ?: Injector, tags ?: string[], value : unknown}) : T;

export function Injectable<T>(token?: T, options ?: {injector ?: Injector, tags ?: string[]}) : ClassDecorator & MethodDecorator;



export function Injectable<T>(token : T | undefined, options ?: {
  injector ?: Injector,
  tags ?: string[],
  class ?: Types.Newable,
  factory ?: Functions.ArgsFunction<unknown[], unknown>,
  dependencies?: unknown[],
  value ?: unknown
}) : T | ClassDecorator | MethodDecorator {
  const injector = options?.injector ?? Injector.getCurrentInjector();
  if (options && options.class && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenType.CLASS,
      tags: options.tags,
      provider: {
        class: options.class
      }
    });
    return token;
  } else if (options && options.factory && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenType.FACTORY,
      tags: options.tags,
      provider: {
        factory: options.factory,
        dependencies: options.dependencies
      }
    });
    return token;
  } else if (options && options.value && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenType.VALUE,
      tags: options.tags,
      provider: {
        value: options.value,
      }
    });
    return token;
  } else {
    return (target: any, methodName ?: string | symbol, descriptor ?: PropertyDescriptor) => {
      if (methodName === undefined) {
        // class decorator
        injector.register(token ?? target, {
          type: TokenType.CLASS,
          tags: options?.tags,
          provider: {
            class: target
          }
        });
      } else if (Objects.isNotNullOrUndefined(token)) {
        // method decorator
        handleInjectableMethodDecorator(target, methodName, descriptor!, token, injector, options?.tags);
      } else {
        throw new InjectorError("Wrong usage - token not specified for factory injectable.");
      }
    };
  }
}

Injectable.Class = function<T>(token?: T, options ?: {injector ?: Injector, tags ?: string[]}) : ClassDecorator {
  const injector = options?.injector ?? Injector.getCurrentInjector();
  return (target: any) => {
    injector.register(token ?? target, {
      type: TokenType.CLASS,
      tags: options?.tags,
      provider: {
        class: target
      }
    });
  };
}

function handleInjectableMethodDecorator(target: any, methodName: keyof typeof target, descriptor : PropertyDescriptor, token: NonNullable<unknown>, injector: Injector, tags ?: string[]) {
  if (Objects.isFunction(target)) {
    // static method
    injector.register(token, {
      type: TokenType.FACTORY,
      tags: tags,
      provider: {
        factory: descriptor.value as Functions.ArgsFunction<unknown[], unknown>
      }
    });
  } else {
    const inversityMetadata : InversityMetadata<typeof target> = getOrCreateInversityClassMetadata(target);
    inversityMetadata.deferInstanceInjectables[methodName] = [token, {
      type: TokenType.FACTORY,
      tags: tags,
      injector: injector
    }];
  }
}
