
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Configuration, Inject, Injectable, Injector } from "../src";

describe("Injectable", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
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

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
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
      const valueToken = Injectable("FIRST_TOKEN", {
        value: "aval"
      });

      const factoryToken = Injectable("SECOND_TOKEN", {
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

  test("configuration class", () => {
    testInjector.runInContext(() => {
      class ServiceA {
        constructor(public readonly text: string) {}
      }
      class ServiceB {
        constructor(public readonly a: ServiceA) {}
      }

      @Configuration()
      class Config {

        public readonly prefix1 : string = "pref1";

        constructor(public readonly prefix2 : string = "pref2") {}

        @Injectable(ServiceA)
        public createServiceA() : ServiceA {
          return new ServiceA(this.prefix1 + "_a");
        }

        @Injectable(ServiceB, {injector: testInjector})
        public createServiceB(@Inject.Param(ServiceA) a: ServiceA) : ServiceB {
          return new ServiceB(a);
        }
      }

      class WithDependencies {
        constructor(
          @Inject.Param(ServiceA) public readonly a : ServiceA,
          @Inject.Param(ServiceB) public readonly b : ServiceB
        ) {
          expect(a).toBeDefined();
          expect(b).toBeDefined();
          expect(b.a).toBeDefined();
          expect(a.text).toBe("pref1_a");
          expect(b.a.text).toBe("pref1_a");
        }
      }

      new Config();

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
  });

  test("configuration class with static methods", () => {
    testInjector.runInContext(() => {
      class ServiceA {
        constructor(public readonly text: string) {}
      }
      class ServiceB {
        constructor(public readonly a: ServiceA) {}
      }

      @Configuration()
      class Config {

        public readonly prefix1 : string = "pref1";

        constructor(public readonly prefix2 : string = "pref2") {}

        @Injectable(ServiceA)
        public static createServiceA() : ServiceA {
          return new ServiceA("_a");
        }

        @Injectable(ServiceB)
        public static createServiceB(@Inject.Param(ServiceA) a: ServiceA) : ServiceB {
          return new ServiceB(a);
        }
      }

      class WithDependencies {
        constructor(
          @Inject.Param(ServiceA) public readonly a : ServiceA,
          @Inject.Param(ServiceB) public readonly b : ServiceB
        ) {
          expect(a).toBeDefined();
          expect(b).toBeDefined();
          expect(b.a).toBeDefined();
          expect(a.text).toBe("_a");
          expect(b.a.text).toBe("_a");
        }
      }

      new Config();

      const ins = testInjector.createInstance(WithDependencies);
      expect(ins).toBeDefined();
    });
  });
});
