
import { beforeEach, describe, expect, test } from '@jest/globals';
import { Inject, Injectable, Injector } from "../src";

describe("simple tests", () => {

  let testInjector : Injector;

  beforeEach(() => {
    testInjector = new Injector();
  });

  test("simple case", () => testInjector.runInContext(() => {

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

});
