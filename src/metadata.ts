import { Injector } from "./Injector";
import { TokenType } from "./TokenType";
import { Token } from './Token';


export type deferInstancePair = [unknown, {
  type: TokenType;
  tags?: string[];
  injector ?: Injector;
  multi ?: boolean;
}];

export interface InversityMetadata<C> {
  deferInstanceInjectables : Record<keyof C, deferInstancePair>;
}

export interface MethodMetadata {
  parameters: (unknown | Token)[];
}

export const InversityMetadataSymbol = Symbol("InversityMetadata");
export const InversityMethodMetadataSymbol = Symbol("InversityMethodMetadata");

export function getInversityMethodMetadata<C>(prototype: any) : MethodMetadata | undefined {
  return prototype[InversityMethodMetadataSymbol];
}

export function getOrCreateInversityMethodMetadata<C>(prototype: any) : MethodMetadata {
  return prototype[InversityMethodMetadataSymbol] ?? (prototype[InversityMethodMetadataSymbol] = {
    parameters: []
  });
}

export function getInversityClassMetadata<C>(prototype: any) : InversityMetadata<C> {
  return prototype[InversityMetadataSymbol];
}

export function getOrCreateInversityClassMetadata<C>(prototype: any) : InversityMetadata<C> {
  const metadata : InversityMetadata<unknown> = prototype[InversityMetadataSymbol] ?? (prototype[InversityMetadataSymbol] = {
    deferInstanceInjectables: Object.create(null)
  });
  return metadata as InversityMetadata<C>;
}
