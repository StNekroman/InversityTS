
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector, InjectorError } from "../src";

describe("manual tokens", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
  });

  test("value token", () => {
    testInjector.runInContext(() => {
      
      const valueToken = Injectable("TEST_TOKEN", {
        value: "aval"
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

      expect(testInjector.createInstance(WithDependencies)).toBeDefined();
    });
  });

  test("symbol token", () => {
    testInjector.runInContext(() => {
      
      const valueToken = Injectable(Symbol("TEST_TOKEN"), {
        value: "aval"
      });

      class WithDependencies {
        constructor(
          @Inject.Param(valueToken) public readonly value1 : string
        ) {
          expect(value1).toBe("aval");
        }
      }

      expect(testInjector.createInstance(WithDependencies)).toBeDefined();
    });
  });

  test("duplicate symbol token", () => {
    testInjector.runInContext(() => {
      
      const valueToken = Injectable(Symbol("TEST_TOKEN"), {
        value: "aval"
      });

      class WithDependencies {
        constructor(
          @Inject.Param(Symbol("TEST_TOKEN")) public readonly value1 : string,
          @Inject.Param(valueToken) public readonly value2 : string
        ) {
          expect(value1).toBe("aval");
          expect(value2).toBe("aval");
        }
      }

      expect(() => testInjector.createInstance(WithDependencies)).toThrow(InjectorError);
    });
  });

  test("class token", () => {
    testInjector.runInContext(() => {
      
      class ServiceA {
        public getText() {
          return "I am ServiceA";
        }
      }

      const valueToken = Injectable("TEST_TOKEN", {
        class: ServiceA
      });

      class WithDependencies {
        constructor(
          @Inject.Param("TEST_TOKEN") public readonly value1 : ServiceA,
          @Inject.Param(valueToken) public readonly value2 : ServiceA
        ) {
          expect(value1).toBeDefined();
          expect(value1.getText()).toBe("I am ServiceA");
          expect(value2).toBeDefined();
          expect(value2.getText()).toBe("I am ServiceA");
        }
      }

      expect(testInjector.createInstance(WithDependencies)).toBeDefined();
    });
  });

  test("class token itself", () => {
    testInjector.runInContext(() => {
      
      class ServiceA {
        public getText() {
          return "I am ServiceA";
        }
      }

      const valueToken = Injectable(ServiceA, {
        class: ServiceA
      });

      class WithDependencies {
        constructor(
          @Inject.Param(ServiceA) public readonly value1 : ServiceA,
          @Inject.Param(valueToken) public readonly value2 : ServiceA
        ) {
          expect(value1).toBeDefined();
          expect(value1.getText()).toBe("I am ServiceA");
          expect(value2).toBeDefined();
          expect(value2.getText()).toBe("I am ServiceA");
        }
      }

      expect(testInjector.createInstance(WithDependencies)).toBeDefined();
    });
  });
});
