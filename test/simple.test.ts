
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector } from "../src";

describe("simple tests", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector("test");
  });

  test("simple case", () => {
    testInjector.runInContext(() => {

      @Injectable()
      class SimpleService {
        public a = "aval";
      }

      class WithDependencies {
        public readonly simple : SimpleService = Inject(SimpleService);

        constructor() {
          expect(this.simple).toBeDefined();
          expect(this.simple.a).toBe("aval");
        }
      }

      const ins = new WithDependencies();
      expect(ins).toBeDefined();
    });
  });

  test("simple constructor", () => {
    testInjector.runInContext(() => {
      @Injectable()
      class SimpleService {
        public a = "aval";
      }

      class WithDependencies {
        constructor(
          @Inject.Param(SimpleService)
          public readonly simple : SimpleService
        ) {
          expect(this.simple).toBeDefined();
          expect(this.simple.a).toBe("aval");
        }
      }

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
  });

  test("manual injector", () => {

      @Injectable(undefined, {
        injector: testInjector
      })
      class SimpleService {
        public a = "aval";
      }

      class WithDependencies {
        public readonly simple : SimpleService = Inject(SimpleService, testInjector);

        constructor() {
          expect(this.simple).toBeDefined();
          expect(this.simple.a).toBe("aval");
        }
      }

      const ins = new WithDependencies();
      expect(ins).toBeDefined();
  });

  test("wrong injector", () => {

      @Injectable({
        injector: testInjector
      })
      class SimpleService {
        public a = "aval";
      }

      class WithDependencies {
        public readonly simple : SimpleService = Inject(SimpleService);

        constructor() {
          expect(this.simple).toBeDefined();
          expect(this.simple.a).toBe("aval");
        }
      }

      expect(() => {
        new WithDependencies();
      }).toThrow();
  });

  test("hide impls from eyes", () => {
    testInjector.runInContext(() => {
      const TYPES = {
        SERVICE_A: Symbol("ServiceA"),
        SERVICE_B: Symbol("ServiceB"),
      };

      interface ServiceA {getTextA() : string;}
      interface ServiceB {getTextB() : string;}

      @Injectable(TYPES.SERVICE_A)
      class ServiceAImpl implements ServiceA {getTextA() {return "a"; }}
      @Injectable(TYPES.SERVICE_B)
      class ServiceBImpl implements ServiceB {getTextB() {return "b"; }}

      class WithDependencies {
        constructor(
          @Inject.Param(TYPES.SERVICE_A) serviceA : ServiceA,
          @Inject.Param(TYPES.SERVICE_B) serviceB : ServiceB
        ) {
          expect(serviceA).toBeDefined();
          expect(serviceA.getTextA()).toBe("a");
          expect(serviceB).toBeDefined();
          expect(serviceB.getTextB()).toBe("b");
        }
      }

      expect(Injector.getCurrentInjector().createInstance(WithDependencies)).toBeDefined();
    });
  });
});
