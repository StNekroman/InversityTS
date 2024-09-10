import { Objects, SingletonGuard, Types } from "@stnekroman/tstools";
import { Injector } from "../Injector";
import { InjectorError } from "../InjectorError";
import { getInversityMethodMetadata, getOrCreateInversityClassMetadata, InversityMetadata, MethodMetadata } from '../metadata';
import { TokenType } from "../TokenType";
import { Injectable } from "./Injectable";

export function Configuration<C>() {
  return <CTR extends Types.Newable<C>>(ctr: CTR) : CTR => {
    ctr = SingletonGuard<C>()(ctr) as CTR; // make sure that class is singleton

    ctr = class extends (ctr as Types.Newable) {
      constructor() {
        super();

        const inversityMetadata : InversityMetadata<C> = getOrCreateInversityClassMetadata<C>(ctr.prototype as Function as Types.Newable<C>);
        Objects.forEach(inversityMetadata.deferInstanceInjectables, (methodName, [token, options]) => {
          if (options.type ===  TokenType.FACTORY) {
            const methodMetadata : MethodMetadata | undefined = getInversityMethodMetadata((this as any)[methodName])
            Injectable(token, {
              injector: options.injector,
              tags: options.tags,
              factory: (this[methodName as keyof ThisType<C>] as Function).bind(this),
              dependencies: methodMetadata?.parameters ?? []
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