
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector, ScopeProvider } from "../src";

describe("scopes", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
  });

  test("prototype", () => testInjector.runInContext(() => {

    class SimpleService {}

    Injectable("TEST_TOKEN", {
      scope: "prototype",
      factory: () => new SimpleService()
    });

    const service1 : SimpleService = Inject("TEST_TOKEN");
    const service2 : SimpleService = Inject("TEST_TOKEN"); // prototype --> each time new instance

    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    expect(service1).not.toBe(service2);
  }));

  test("caching", () => testInjector.runInContext(() => {

    class SimpleService {}

    let currentSessionId : string = "1"; // or requestId, or traceId, or whateverIdentifier

    Injectable("TEST_TOKEN", {
      scope: () => currentSessionId,
      factory: () => new SimpleService()
    });

    const service1 : SimpleService = Inject("TEST_TOKEN");
    const service2 : SimpleService = Inject("TEST_TOKEN"); // the same service should arrive, as currentSessionId unchanged
    currentSessionId = "2"; // new request, or session, or something
    const service3 : SimpleService = Inject("TEST_TOKEN");
    currentSessionId = "1";
    const service4 : SimpleService = Inject("TEST_TOKEN"); // reuse previous

    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    expect(service3).toBeDefined();
    expect(service4).toBeDefined();
    expect(service1).toBe(service2);
    expect(service1).toBe(service4);
    expect(service1).not.toBe(service3);
  }));

  test("custom impl", () => testInjector.runInContext(() => {

    class SimpleService {}

    let currentSessionId : string = "1"; // or requestId, or traceId, or whateverIdentifier

    Injectable("TEST_TOKEN", {
      scope: class <T> extends ScopeProvider<T> { // this is singleton impl
        private instance ?: T;
        public override get(injector: Injector): T {
          // here you can do whatever you want
          if (!this.instance) {
            this.instance = this.metadata.instantiate(injector);
          }
          return this.instance; // you need return created instance
        }
      },
      factory: () => new SimpleService()
    });

    const service1 : SimpleService = Inject("TEST_TOKEN");
    const service2 : SimpleService = Inject("TEST_TOKEN");
    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    expect(service1).toBe(service2);
  }));

});
