import { Objects, SingletonGuard, Types } from "@stnekroman/tstools";
import { InjectorError } from "../InjectorError";
import { getInversityMethodMetadata, getOrCreateInversityClassMetadata, InversityMetadata, MethodMetadata } from '../metadata';
import { TokenProviderType } from "../TokenProviderType";
import { Injectable } from "./Injectable";

export function Configuration<C>() {
  return <CTR extends Types.Newable<C>>(ctr: CTR) : CTR => {
    ctr = SingletonGuard<C>()(ctr) as CTR; // make sure that class is singleton

    const inversityMetadata : InversityMetadata<C> = getOrCreateInversityClassMetadata<C>(ctr.prototype);

    ctr = class extends (ctr as Types.Newable) {
      constructor() {
        super();

        Objects.forEach(inversityMetadata.deferInstanceInjectables, (methodName, [token, options]) => {
          if (options.type ===  TokenProviderType.FACTORY) {
            const methodMetadata : MethodMetadata | undefined = getInversityMethodMetadata((this as any)[methodName])
            Injectable(token, {
              injector: options.injector,
              tags: options.tags,
              multi: options.multi,
              factory: (this[methodName as keyof ThisType<C>] as Function).bind(this),
              dependencies: methodMetadata?.parameters ?? [],
              scope: options?.scope,
              weak: options?.weak
            });
          } else {
            throw new InjectorError("Unsupported type for defer inject");
          }
        });
      }
    } as CTR;

    return ctr;
  };
}