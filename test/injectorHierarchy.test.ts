
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector, InjectorError } from "../src";

describe("injector hierarchy", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
  });

  test("child inherits parent", () => {
    testInjector = new Injector(Injector.root); // inherits it
    testInjector.runInContext(() => {

      const TOKEN1 = Injectable(Symbol("TOKEN1"), {
                       value: "aval",
                       injector: Injector.root
                     });
      const TOKEN2 = Injectable(Symbol("TOKEN1"), {
                        value: "aval",
                     }); // will use injector from context - testInjector

      class WithDependencies {
        constructor(
          @Inject.Param(TOKEN1) token1: string,
          @Inject.Param(TOKEN2) token2: string
        ) {
          expect(token1).toBeDefined();
          expect(token1).toBe("aval");
          expect(token2).toBeDefined();
          expect(token2).toBe("aval");
        }
      }

      expect(testInjector.createInstance(WithDependencies)).toBeDefined();
    });
  });

  test("child doesn't inherit parent", () => {
    testInjector.runInContext(() => {

      const TOKEN1 = Injectable(Symbol("TOKEN1"), {
                       value: "aval",
                       injector: Injector.root
                     });
      const TOKEN2 = Injectable(Symbol("TOKEN1"), {
                        value: "aval",
                     }); // will use injector from context - testInjector

      class WithDependencies {
        constructor(
          @Inject.Param(TOKEN1) token1: string,
          @Inject.Param(TOKEN2) token2: string
        ) {
          expect(token1).toBeDefined();
          expect(token1).toBe("aval");
          expect(token2).toBeDefined();
          expect(token2).toBe("aval");
        }
      }

      expect(() => testInjector.createInstance(WithDependencies)).toThrow(InjectorError);
    });
  });

  test("overwrite token value in child", () => {
    testInjector = new Injector(Injector.root); // inherits it

    const TOKEN = Symbol("TOKEN");

    Injectable(TOKEN, {
      value: "rootVal",
      injector: Injector.root
    });
    Injectable(TOKEN, {
      value: "childVal",
      injector: testInjector
    });

    expect(Inject(TOKEN, Injector.root)).toBe("rootVal");
    expect(Inject(TOKEN, testInjector)).toBe("childVal");
    expect(testInjector.runInContext(() => Inject(TOKEN))).toBe("childVal");
  });

});
