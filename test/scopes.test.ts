
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector } from "../src";

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

});
