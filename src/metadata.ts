import { Injector } from "./Injector";
import { TokenProviderType } from "./TokenProviderType";
import { Token, TokenType } from './Token';
import { TokenScope } from "./TokenMetadata";


export type deferInstancePair = [TokenType, {
  type: TokenProviderType;
  tags?: string[];
  injector ?: Injector;
  multi ?: boolean;
  scope ?: TokenScope;
}];

export interface InversityMetadata<C> {
  deferInstanceInjectables : Record<keyof C, deferInstancePair>;
}

export interface MethodMetadata {
  parameters: (TokenType | Token)[];
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
