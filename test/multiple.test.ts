
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Objects } from '@stnekroman/tstools';
import { Configuration, ForwardRef, Inject, Injectable, Injector, InjectorError, Token } from "../src";

describe("multiple injectables", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector("test");
  });

  test("redirect", () => testInjector.runInContext(() => {

    const TOKEN = Symbol("TOKEN");
    const REDIRECT_TOKEN = Symbol("REDIRECT_TOKEN");

    Injectable(REDIRECT_TOKEN, {
      redirect: TOKEN
    });

    @Injectable(TOKEN)
    class SimpleService {
      public a = "aval";
    }

    class WithDependencies {
      public readonly simple : SimpleService = Inject(TOKEN);
      public readonly simple2 : SimpleService = Inject(REDIRECT_TOKEN);

      constructor() {
        expect(this.simple).toBeDefined();
        expect(this.simple.a).toBe("aval");
        expect(this.simple2).toBeDefined();
        expect(this.simple).toBe(this.simple2);
      }
    }

    const ins = new WithDependencies();
    expect(ins).toBeDefined();
  }));

  test("single injectable overwrites", () => testInjector.runInContext(() => {
    const TEST_TOKEN = Symbol("TEST_TOKEN");

    const valueToken = Injectable(TEST_TOKEN, {
      value: "aval"
    });

    const valueToken2 = Injectable(TEST_TOKEN, {
      value: "bval"
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN) public readonly value : string
      ) {
        expect(value).toBe("bval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("multiple injectables", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN, {multi: true}) public readonly values : string[]
      ) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(2);
        expect(values[0]).toBe("aval");
        expect(values[1]).toBe("bval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("multiple injectables with Inject", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    class WithDependencies {
      public readonly values : string[] = Inject(new Token(TEST_TOKEN, {multi: true}));
    }

    const ins = new WithDependencies();
    expect(ins.values).toBeDefined();
    expect(Objects.isArray(ins.values)).toBeTruthy();
    expect(ins.values).toHaveLength(2);
    expect(ins.values[0]).toBe("aval");
    expect(ins.values[1]).toBe("bval");
  }));

  test("multiple injectables, not single expected", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN) public readonly values : string[]
      ) {}
    }

    expect(() => testInjector.createInstance(WithDependencies)).toThrow(InjectorError);
  }));

  test("single overwrites", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval"
    });
    Injectable(TEST_TOKEN, {
      value: "bval"
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN) public readonly value : string
      ) {
        expect(value).toBe("bval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("one injectable in multi, many expected", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN, {multi: true}) public readonly values : string[]
      ) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(1);
        expect(values[0]).toBe("aval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("one injectable, many expected", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval"
    });

    class WithDependencies {
      constructor(
        @Inject.Param(TEST_TOKEN, {multi: true}) public readonly values : string[]
      ) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(1);
        expect(values[0]).toBe("aval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("service with multiple injectable", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    @Injectable()
    class ServiceA {
      constructor(@Inject.Param(TEST_TOKEN, {multi: true}) public readonly values : string[]) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(2);
        expect(values[0]).toBe("aval");
        expect(values[1]).toBe("bval");
      }
    }

    class WithDependencies {
      constructor(
        @Inject.Param(ServiceA) public readonly serviceA : ServiceA
      ) {
        expect(serviceA).toBeDefined();
        expect(Objects.isArray(serviceA.values)).toBeTruthy();
        expect(serviceA.values).toHaveLength(2);
        expect(serviceA.values[0]).toBe("aval");
        expect(serviceA.values[1]).toBe("bval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("service with multiple injectable will fail as factory expects single instance", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    class ServiceA {
      constructor(public readonly values : string[]) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(2);
        expect(values[0]).toBe("aval");
        expect(values[1]).toBe("bval");
      }
    }

    Injectable("factoryService", {
      dependencies: [
        TEST_TOKEN
      ],
      factory : (values : string[]) => {
        return new ServiceA(values);
      }
    });

    class WithDependencies {
      constructor(
        @Inject.Param("factoryService") public readonly serviceA : ServiceA
      ) {
        expect(serviceA).toBeDefined();
        expect(Objects.isArray(serviceA.values)).toBeTruthy();
        expect(serviceA.values).toHaveLength(2);
        expect(serviceA.values[0]).toBe("aval");
        expect(serviceA.values[1]).toBe("bval");
      }
    }

    expect(() => testInjector.createInstance(WithDependencies)).toThrow(InjectorError);
  }));

  test("service with multiple injectable", () => testInjector.runInContext(() => {

    const TEST_TOKEN = Symbol("TEST_TOKEN");
    Injectable(TEST_TOKEN, {
      value: "aval",
      multi: true
    });
    Injectable(TEST_TOKEN, {
      value: "bval",
      multi: true
    });

    class ServiceA {
      constructor(public readonly values : string[]) {
        expect(values).toBeDefined();
        expect(Objects.isArray(values)).toBeTruthy();
        expect(values).toHaveLength(2);
        expect(values[0]).toBe("aval");
        expect(values[1]).toBe("bval");
      }
    }

    Injectable("factoryService", {
      dependencies: [
        new Token(TEST_TOKEN, {multi: true})
      ],
      factory : (values : string[]) => {
        return new ServiceA(values);
      }
    });

    class WithDependencies {
      constructor(
        @Inject.Param("factoryService") public readonly serviceA : ServiceA
      ) {
        expect(serviceA).toBeDefined();
        expect(Objects.isArray(serviceA.values)).toBeTruthy();
        expect(serviceA.values).toHaveLength(2);
        expect(serviceA.values[0]).toBe("aval");
        expect(serviceA.values[1]).toBe("bval");
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("collect services", () => testInjector.runInContext(() => {

    interface Handler {
      handle() : boolean;
    }

    @Injectable()
    class ServiceHandlerA implements Handler {
      public handle() : boolean {
        return true;
      }
    }
    Injectable("magicHandler", {
      redirect: ServiceHandlerA,
      multi: true
    });

    @Injectable()
    class ServiceHandlerB implements Handler {
      public handle() : boolean {
        return false;
      }
    }
    Injectable("magicHandler", {
      redirect: ServiceHandlerA,
      multi: true
    });

    class WithDependencies {
      constructor(
        @Inject.Param("magicHandler", {multi: true}) public readonly handlers : Handler[]
      ) {
        expect(handlers).toBeDefined();
        expect(Objects.isArray(handlers)).toBeTruthy();
        expect(handlers).toHaveLength(2);
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("collect services with forwardRefs", () => testInjector.runInContext(() => {

    interface Handler {
      handle() : boolean;
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerA implements Handler {
      public handle() : boolean {
        return true;
      }
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerB implements Handler {
      public handle() : boolean {
        return false;
      }
    }

    class WithDependencies {
      constructor(
        @Inject.Param("magicHandler", {multi: true}) public readonly handlers : Handler[]
      ) {
        expect(handlers).toBeDefined();
        expect(Objects.isArray(handlers)).toBeTruthy();
        expect(handlers).toHaveLength(2);
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("collect services with forwardRefs and factory in middle", () => testInjector.runInContext(() => {

    interface Handler {
      handle() : boolean;
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerA implements Handler {
      public handle() : boolean {
        return true;
      }
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerB implements Handler {
      public handle() : boolean {
        return false;
      }
    }

    Injectable("factoryService", {
      dependencies: [
        new Token("magicHandler", {multi: true})
      ],
      factory : (handlers : Handler[]) => {
        expect(handlers).toBeDefined();
        expect(Objects.isArray(handlers)).toBeTruthy();
        expect(handlers).toHaveLength(2);
        return handlers;
      }
    });

    class WithDependencies {
      constructor(
        @Inject.Param("factoryService") public readonly handlers : Handler[]
      ) {
        expect(handlers).toBeDefined();
        expect(Objects.isArray(handlers)).toBeTruthy();
        expect(handlers).toHaveLength(2);
      }
    }

    testInjector.createInstance(WithDependencies);
  }));

  test("collect services with forwardRefs and configuration class in middle", () => testInjector.runInContext(() => {

    interface Handler {
      handle() : boolean;
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerA implements Handler {
      public handle() : boolean {
        return true;
      }
    }

    Injectable("magicHandler", {
      redirect: new ForwardRef(() => ServiceHandlerA),
      multi: true
    });
    @Injectable()
    class ServiceHandlerB implements Handler {
      public handle() : boolean {
        return false;
      }
    }

    @Configuration()
    class Config {
      @Injectable("allHandlers")
      public getHandlers(
        @Inject.Param("magicHandler", {multi: true}) handlers : Handler[]
      ) : Handler[] {
        return handlers;
      }
    }

    class WithDependencies {
      constructor(
        @Inject.Param("allHandlers") public readonly handlers : Handler[]
      ) {
        expect(handlers).toBeDefined();
        expect(Objects.isArray(handlers)).toBeTruthy();
        expect(handlers).toHaveLength(2);
      }
    }

    new Config();

    testInjector.createInstance(WithDependencies);
  }));

});
