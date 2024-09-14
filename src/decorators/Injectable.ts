import { Functions, Objects, Types } from "@stnekroman/tstools";
import { Injector } from '../Injector';
import { InjectorError } from "../InjectorError";
import { getOrCreateInversityClassMetadata, InversityMetadata } from "../metadata";
import { TokenScope } from "../TokenMetadata";
import { TokenProviderType } from "../TokenProviderType";


type InjectableOptions = {
  injector ?: Injector;
  tags ?: string[];
  multi ?: boolean;
  scope ?: TokenScope;
}

export function Injectable<T>(token: T, options : InjectableOptions & {class : Types.Newable}) : T;
export function Injectable<T,ARGS extends unknown[]>(token: T, options : InjectableOptions & {factory : Functions.ArgsFunction<ARGS, unknown>, dependencies?: unknown[]}) : T;
export function Injectable<T>(token: T, options : InjectableOptions & {value : unknown}) : T;
export function Injectable<T>(token: T, options : InjectableOptions & {redirect : unknown}) : T;

export function Injectable<T>(token?: T, options ?: InjectableOptions) : ClassDecorator & MethodDecorator;

export function Injectable<T>(token : T | undefined, options ?: InjectableOptions & {
  class ?: Types.Newable,
  factory ?: Functions.ArgsFunction<unknown[], unknown>,
  dependencies?: unknown[],
  value ?: unknown,
  redirect ?: unknown
}) : T | ClassDecorator | MethodDecorator {
  const injector = options?.injector ?? Injector.getCurrentInjector();
  if (options && options.class && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenProviderType.CLASS,
      tags: options.tags,
      multi: options.multi,
      scope: options.scope,
      provider: {
        class: options.class
      }
    });
    return token;
  } else if (options && options.factory && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenProviderType.FACTORY,
      tags: options.tags,
      multi: options.multi,
      scope: options.scope,
      provider: {
        factory: options.factory,
        dependencies: options.dependencies
      }
    });
    return token;
  } else if (options && options.value && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenProviderType.VALUE,
      tags: options.tags,
      multi: options.multi,
      scope: options.scope,
      provider: {
        value: options.value
      }
    });
    return token;
  } else if (options && options.redirect && Objects.isNotNullOrUndefined(token)) {
    injector.register(token, {
      type: TokenProviderType.REDIRECT,
      tags: options.tags,
      multi: options.multi,
      scope: options.scope,
      provider: {
        redirect: options.redirect
      }
    });
    return token;
  } else {
    return (target: any, methodName ?: string | symbol, descriptor ?: PropertyDescriptor) => {
      if (methodName === undefined) {
        // class decorator
        injector.register(token ?? target, {
          type: TokenProviderType.CLASS,
          tags: options?.tags,
          multi: options?.multi,
          scope: options?.scope,
          provider: {
            class: target
          }
        });
      } else if (Objects.isNotNullOrUndefined(token)) {
        // method decorator
        handleInjectableMethodDecorator(target, methodName, descriptor!, token, options);
      } else {
        throw new InjectorError("Wrong usage - token not specified for factory injectable.");
      }
    };
  }
}

function handleInjectableMethodDecorator(target: any, methodName: keyof typeof target, descriptor : PropertyDescriptor, 
      token: NonNullable<unknown>,
      options ?: InjectableOptions) {
  const injector = options?.injector ?? Injector.getCurrentInjector();
  if (Objects.isFunction(target)) {
    // static method
    injector.register(token, {
      type: TokenProviderType.FACTORY,
      tags: options?.tags,
      multi: options?.multi,
      scope: options?.scope,
      provider: {
        factory: descriptor.value as Functions.ArgsFunction<unknown[], unknown>
      }
    });
  } else {
    const inversityMetadata : InversityMetadata<typeof target> = getOrCreateInversityClassMetadata(target);
    inversityMetadata.deferInstanceInjectables[methodName] = [token, {
      type: TokenProviderType.FACTORY,
      tags: options?.tags,
      injector: injector,
      multi: options?.multi,
      scope: options?.scope
    }];
  }
}
