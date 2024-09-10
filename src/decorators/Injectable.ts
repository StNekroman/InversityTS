import { Functions, Objects, Types } from "@stnekroman/tstools";
import { Injector } from '../Injector';
import { getOrCreateInversityClassMetadata, InversityMetadata } from "../metadata";
import { TokenType } from "../TokenType";


export function Injectable<T>(token: T, options : {injector ?: Injector, tags ?: string[], class : Types.Newable}) : T;
export function Injectable<T, ARGS extends unknown[]>(token: T, options : {injector ?: Injector, tags ?: string[], factory : Functions.ArgsFunction<ARGS, unknown>, dependencies?: unknown[]}) : T;
export function Injectable<T>(token: T, options : {injector ?: Injector, tags ?: string[], value : unknown}) : T;

export function Injectable(options ?: {injector ?: Injector, tags ?: string[]}) : ClassDecorator;
export function Injectable<T>(token: T, options ?: {injector ?: Injector, tags ?: string[]}) : MethodDecorator;

export function Injectable<T>(optionsOrToken ?: {
                                injector ?: Injector,
                                type ?: TokenType,
                                tags ?: string[]
                              } | T,
                              options ?: {
                                injector ?: Injector,
                                tags ?: string[],
                                class ?: Types.Newable,
                                factory ?: Functions.ArgsFunction<unknown[], unknown>,
                                dependencies?: unknown[],
                                value ?: unknown
                              }) {
  if (arguments.length  > 1) {
    const injector = options!.injector ?? Injector.getCurrentInjector();
    let tokenType : TokenType;
    if (options!.class !== undefined) {
      tokenType = TokenType.CLASS;
    } else if (options!.factory !== undefined) {
      tokenType = TokenType.FACTORY;
    } else if (options!.value !== undefined) {
      tokenType = TokenType.VALUE;
    } else {
      // method decorator version

      return (target: any, methodName: keyof typeof target, descriptor: TypedPropertyDescriptor<any>) => {
        handleInjectableMethodDecorator(target, methodName, descriptor, optionsOrToken, injector, options!.tags);
      };
    }

    // function version
    injector.register(optionsOrToken, {
      type: tokenType,
      tags: options!.tags,
      provider: {
        class: options!.class,
        factory: options!.factory,
        value: options!.value,
        dependencies: options!.dependencies
      }
    });

    return optionsOrToken;
  } else {
    // class decorator version
    return (target: any, methodName ?: string | symbol, descriptor ?: PropertyDescriptor) => {
      if (methodName === undefined) {
        // class decorator
        const opts = optionsOrToken as {
          injector ?: Injector,
          type ?: TokenType,
          tags ?: string[]
        } | undefined;
        handleInjectableClassDecorator(opts?.type ?? TokenType.CLASS, target, opts?.injector, opts?.tags);
      } else {
        // method decorator
        handleInjectableMethodDecorator(target, methodName, descriptor!, optionsOrToken, undefined, undefined);
      }
    };
  }
}

function handleInjectableClassDecorator(tokenType :  TokenType, target: any, injector?: Injector, tags ?: string[]) {
  injector ??= Injector.getCurrentInjector();
  injector.register(target, {
    type: tokenType,
    tags: tags,
    provider: {
      class: tokenType === TokenType.CLASS ? target as Types.Newable : undefined,
      factory: tokenType === TokenType.FACTORY ? target as Functions.ArgsFunction<unknown[], unknown> : undefined,
      value: tokenType === TokenType.VALUE ? target : undefined
    }
  });
}

function handleInjectableMethodDecorator(target: any, methodName: keyof typeof target, descriptor : PropertyDescriptor, token: unknown, injector?: Injector, tags ?: string[]) {
  injector ??= Injector.getCurrentInjector();
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
