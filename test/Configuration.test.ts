
import { beforeEach, describe, expect, test } from '@jest/globals';
import { SingletonGuardError } from '@stnekroman/tstools';
import { Configuration, Inject, Injectable, Injector } from "../src";

describe("Injectable", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
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

  test("configuration class - create via injector", () => {
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

      testInjector.createInstance(Config);

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

  test("configuration class - double call", () => {
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
      expect(() => {
        new Config();
      }).toThrow(SingletonGuardError);

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

      expect(() => {
        testInjector.createInstance(WithDependencies);
      }).toThrow();
    });
  });
});
