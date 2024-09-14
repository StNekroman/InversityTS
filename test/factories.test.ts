
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector, TokenProviderType } from "../src";

describe("factories", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector("test");
  });

  test("factory token", () => {
    testInjector.runInContext(() => {
      const valueToken = Injectable("TEST_TOKEN", {
        factory: () => "aval"
      });

      class WithDependencies {
        constructor(
          @Inject.Param("TEST_TOKEN") public readonly value1 : string,
          @Inject.Param(valueToken) public readonly value2 : string
        ) {
          expect(value1).toBe("aval");
          expect(value2).toBe("aval");
        }
      }

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
  });

  test("nested factory token", () => {
    testInjector.runInContext(() => {
      const valueToken = Injectable(Symbol("FIRST_TOKEN"), {
        value: "aval"
      });

      const factoryToken = Injectable(Symbol("SECOND_TOKEN"), {
        dependencies: [valueToken],
        factory: (val: string) => val + "_bval"
      });

      class WithDependencies {
        constructor(
          @Inject.Param(factoryToken) public readonly value : string
        ) {
          expect(value).toBe("aval_bval");
        }
      }

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
  });

  test("factory token via factor createInstance", () => testInjector.runInContext(() => {
    const valueToken = Injectable("TEST_TOKEN", {
      factory: () => "aval"
    });

    testInjector.createInstance((value1 : string, value2 : string) => {
      expect(value1).toBe("aval");
      expect(value2).toBe("aval");
    }, {
      type: TokenProviderType.FACTORY,
      dependencies: ["TEST_TOKEN", valueToken]
    });
  }));

});
