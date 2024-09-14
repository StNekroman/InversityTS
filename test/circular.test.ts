
import { beforeEach, describe, expect, test } from '@jest/globals';
import { CircularDependencyError, Inject, Injectable, Injector, Token } from "../src";

describe("circular dependency detection", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector("test");
  });

  test("no circular", () => testInjector.runInContext(() => {

    Injectable("VALUE_TOKEN", {
      value: "val"
    });

    const ServiceToken = Symbol("ServiceToken");

    interface BaseService {
      value : string;
    }

    @Injectable(ServiceToken, {
      multi: true
    })
    class ServiceA implements BaseService {
      constructor(@Inject.Param("VALUE_TOKEN") public readonly value : string) {}
    }

    @Injectable(ServiceToken, {
      multi: true
    })
    class ServiceB implements BaseService {
      constructor(@Inject.Param("VALUE_TOKEN") public readonly value : string) {}
    }

    const services : BaseService[] = Inject(new Token(ServiceToken, {multi: true}));

    expect(services).toBeDefined();
    expect(services).toHaveLength(2);
    expect(services[0].value).toBe("val");
    expect(services[1].value).toBe("val");
  }));

  test("simple circular", () => testInjector.runInContext(() => {
    const token1 = Symbol("token1");
    const token2 = Symbol("token2");

    Injectable(token1, {
      dependencies: [token2],
      factory: () => {}
    });

    Injectable(token2, {
      dependencies: [token1],
      factory: () => {}
    });

    expect(() => Inject(token2)).toThrow(CircularDependencyError);
  }));

  test("deeper circular", () => testInjector.runInContext(() => {
    Injectable("token1", {
      dependencies: ["token3"],
      factory: () => {}
    });

    Injectable("token2", {
      dependencies: ["token1"],
      factory: () => {}
    });

    Injectable("token3", {
      dependencies: ["token2"],
      factory: () => {}
    });

    Injectable("token4", {
      dependencies: ["token3"],
      factory: () => {}
    });

    Injectable("token5", {
      dependencies: ["token4"],
      factory: () => {}
    });

    expect(() => Inject("token5")).toThrow(CircularDependencyError);
  }));
  
  test("deeper circular", () => testInjector.runInContext(() => {
    Injectable("token1", {
      dependencies: ["token3"],
      factory: () => {}
    });

    Injectable("token2", {
      redirect: "token1"
    });

    Injectable("token3", {
      dependencies: ["token2"],
      factory: () => {}
    });

    Injectable("token4", {
      dependencies: ["token3"],
      factory: () => {}
    });

    Injectable("token5", {
      dependencies: ["token4"],
      factory: () => {}
    });

    expect(() => Inject("token5")).toThrow(CircularDependencyError);
  }));

});
