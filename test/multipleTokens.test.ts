
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector } from "../src";

describe("Injectable", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
  });

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

});
