[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

# Lightweight IoC (Inversion of Control) and DI (Dependency Injection) library.

Inspired by Angular and Spring Frameworks.  
Injectors serve function of IoC containers.  
Injectors have hierarchy - everything known on parent level will be available for DI at child level.  
Child injectors can override parent tokens for his level and for nested, if any.  
Injectors can be detached from root.  
Tokens can be multiple in scope of one injector - you can request singleton instance from injectable or all, it it's multi.  
This library doesn't use reflect-metadata, the solution is prototype-based.

## Table of Contents

- [Installation](#installation)
- [Terminology](#terminology)
- [API Overview](#api-overview)
  - [@Injectable](#injectable)
  - [Scopes](#scopes)
  - [Inject](#inject)
  - [@Inject.Param](#injectparam)
  - [Injector](#injector)
  - [@Configuration](#configuration)
  - [ForwardRef](#forwardref)
  - [Token](#token)
- [Usage examples](#usage-examples)
  - [Inject Example](#inject-example)
  - [constructor has dependencies example](#constructor-has-dependencies-example)
  - [Hide implementation from consumer's eyes example](#hide-implementation-from-consumers-eyes-example)
  - [Manual definition of tokens example](#manual-definition-of-tokens-example)
  - [Factories example](#factories-example)
  - [Injectors hierarchy example](#injectors-hierarchy-example)
  - [Injector context example](#injector-context-example)
  - [token redirect](#token-redirect)
  - [multiple tokens](#multiple-tokens)
  - [scopes](#scopes)

## Installation

npm

```shell
npm i @stnekroman/inversityts
```

yarn

```shell
yarn add @stnekroman/inversityts
```

And in your tsconfig.json you need to set (if you want to use decorators)

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Terminology

`token` - something, against what (or "for what") to create new `instance`.  
Token can be literally anything - Symbol (recommended), string, object, class.  
`instance` - result of DI process (`Injector.createInstance()` call) against requested `token`.  
`injectable` - defined rule for creation of new instance(s) for specific token.  
You can treat it as "bridge" from `token` to `instance`  
`injector` - IoC container, which holds already created `instances`, holds definitions of `injectables` and can create `instances`

## API Overview

### @Injectable

Defines new injectable, describes how to create instance of it (single value, factory or class))

Can be called:

- as decorator on class - then class will be used to create new instances via `new`
- as decorator on class method - if class annotated with `@Configuration, then annotated method will be used as factory for new instances. (works both on static and non-static method, see `@Configuration` for more info)
- as function call to manually define new injectable

| Param     | Description                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `token`   | Token for new injectable                                                                                                   |
| `options` | Optional options structure, which may contain:                                                                             |
|           | \* `injector` - direct ref to injector to use                                                                              |
|           | \*`tags` - reversed for future, not in use currently                                                                       |
|           | \*`class` - (for function call only) specifies which class to use to generate new instance                                 |
|           | \*`value` - (for function call only) specifies static value, which will be used as instance                                |
|           | \*`redirect` - (for function call only) specifies another token, which will be used instead                                |
|           | \*`factory` - (for function call only) specifies factory function which will be used to generate new instance              |
|           | \*`dependencies` - (for function call only) additional possible input dependenes for `factory` function - list of `token`s |
|           | \*`scope` - indicates when to re-use existing instance, when - to create new                                               |

### Scopes

List of possible scopes:

| Scope                 | Description                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `singleton` (default) | Only one instance is create for injectable, cached and shared for future injects                               |
| `prototype`           | Each new inject call will cause new instance to be created                                                     |
| `cache`               | Internal caching map will be used, you need only specify provider, which will provide string keys to that map. |
|                       | On key change - new instance will be created. In order to active this scope mode you need just pass in         |
|                       | a function `() => string`, cache key provider                                                                  |
| `custom`              | That is possible to completely override logic of scoping and instances creation.                               |
|                       | Via passing in class `extends ScopeProvider`.                                                                  |

### @Inject

Function to create (or get, if already exists) instance against given token.

| Param      | Description                                           |
| ---------- | ----------------------------------------------------- |
| `token`    | Token against which to create (or get) new injectable |
| `injector` | Optional injectorto use                               |

### @Inject.Param

Decorator, used to annotate parameters in class constructor or factory function as injectable targets.  
DI process will use this info to find/create corresponding instances and inject them as parameter.  
Accepts only one argument - `token`

### Injector

IoC container, used to register, get and create injectable instances against given tokens.

| Method                        | Description                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `root` (static)               | Built-in default global root injector                                                             |
| `getCurrentInjector` (static) | Method to return 'current' injector, associated with current context                              |
| `register`                    | Low-level method to register injectables. Better use `Injectable` instead                         |
| `get`                         | Resolves given token to instace.                                                                  |
|                               | \* If injector has it internal cache - returns ready-to-use instance                              |
|                               | \* If injector has injectable (metadata to create instance) - creates it and returns ref          |
|                               | (despite if parent injector already has created instance, new metadata/injectable - new instance) |
|                               | \* If no instance and no injectable metadata - asks parent for it (he may have something)         |

### @Configuration

Annotation for class, which may product injectables via methods (static and/or non-static) as factory methods.  
Doesn't contain any input parameters so far. But it required for method-based injectable processing.  
It's singleton - only one instance of such class may be created.

### ForwardRef

Used for redirect tokens to pass token, which is not yet constucted.

### Token

In case cases you might want to wrap your token to `Token` wrapper.  
Cases are:

- passing dependency to list of `dependencies` for raw factory function with `multi: true`
- using this wrapper to pass options (like `multi: true`) to direct `Inject` call.

## Usage examples

### Inject example

```TypeScript
@Injectable()
class SimpleService {
  public doSomething() {
    // ...
  };
}

class WithDependencies {
  public readonly simple : SimpleService = Inject(SimpleService);
}

const ins = new WithDependencies(); // if constructor doesn't have dependencies
```

### constructor has dependencies example

```TypeScript
@Injectable()
class SimpleService {
  public doSomething() {
    // ...
  };
}

class WithDependencies {
  constructor(@Inject.Param(SimpleService) simple : SimpleService) {}
}

const ins = Injector.getCurrentInjector().createInstance(WithDependencies);
```

### Hide implementation from consumer's eyes example

```TypeScript
const TYPES = {
  SERVICE_A: Symbol("ServiceA"),
  SERVICE_B: Symbol("ServiceB"),
};

interface ServiceA {...}
interface ServiceB {...}

@Injectable(TYPES.SERVICE_A)
class ServiceAImpl implements ServiceA {...}
@Injectable(TYPES.SERVICE_B)
class ServiceBImpl implements ServiceB { // can have inner dependencies
  constructor( @Inject.Param(TYPES.SERVICE_A) serviceA : ServiceA) {...}
}

class WithDependencies {
  constructor(
    @Inject.Param(TYPES.SERVICE_A) serviceA : ServiceA,
    @Inject.Param(TYPES.SERVICE_B) serviceB : ServiceB
  ) {...}
}

const ins = Injector.getCurrentInjector().createInstance(WithDependencies);
```

### Manual definition of tokens example

```TypeScript
const valueToken = Injectable(Symbol("TEST_TOKEN"), {
  value: "aval"
}); // function call returns `token` back

class WithDependencies {
  constructor(
    @Inject.Param(Symbol("TEST_TOKEN")) public readonly value1 : string,
    @Inject.Param(valueToken) public readonly value2 : string // valueToken is Symbol("TEST_TOKEN")
  ) {
    expect(value1).toBe("aval");
    expect(value2).toBe("aval");
  }
}
```

### Factories example

```TypeScript
const valueToken = Injectable(Symbol("TEST_TOKEN"), {
  factory: () => "aval" // just a provider function, without additional dependencies
});

const factoryToken = Injectable(Symbol("SECOND_TOKEN"), {
  dependencies: [valueToken], // this factory relies on other dependencies
  factory: (val: string) => val + "_bval"
});
```

Factories from class methods.  
All classes, that can product injectables must be annotated with `@Configuration()`  
Class can expose outside a static method, which will be used to generate injectable - this will work as regular factory method.  
Or class instance can be instantiated/constructed and his regular methods (non-static, in order to access inner state) can be used.  
Class, annotated with `@Configuration()` decorator can be created only once (singleton). Exception will raise on attempt to create second instance.

```TypeScript

@Configuration()
class Config {

  constructor(private readonly prefix : string = "pref_") {}

  @Injectable(ServiceA)
  public createServiceA() : ServiceA {
    return new ServiceA(this.prefix + "a");
  }

  @Injectable(ServiceB)
  public static createServiceB(@Inject.Param(ServiceA) a: ServiceA) : ServiceB {
    return new ServiceB(a);
  }
}

new Config(); // is enough if constructor doesn't need dependencies
// OR
Injector.getCurrentInjector().createInstance(Config);
```

### Injectors hierarchy example

There is always `Injector.root` built-in injector, which is global and default if you don't specify else.  
When you need create new injector, you do `const injector = new Injector("name", Injector.root)` if you want to create child injector  
or `const injector = new Injector("name")` if you need completely detached injector.  
All tokens and instances, which are knowns in parent - will be visible for child injector.  
If injector was asked to create instance for some token - it will immediately return ready-to-use instance, if such exists in internal cache.  
If doesn't exists - we look for definition, if current injector can construct new instance. If can - constructs, if cannot - delegates the call to parent injector.  
This way you can override tokens as:

```TypeScript

const TOKEN = Symbol("TOKEN");

Injectable(TOKEN, {
  value: "rootVal",
  injector: Injector.root
});
Injectable(TOKEN, {
  value: "childVal",
  injector: testInjector
});

Inject(TOKEN, Injector.root); // = "rootVal"
Inject(TOKEN, testInjector); // = "childVal"
```

### Injector context example

When defining injectable via `Injectable` function you can optionally pass parameters as second argument.

```TypeScript

const TOKEN1 = Injectable(Symbol("TOKEN1"), {
  value: "aval",
  injector: customInjector
});

@Injectable(undefined, { // first argument is always `token`, if you want treat current class as token itself - pass `undefined`
  injector: customInjector
})
class SomeServiceImpl {}

```

Or there is another alternative- use `injector.runInContext`

```TypeScript
injector.runInContext(() => {
  // do work
});
```

this will temporary bind `injector` - from which you called `runInContext` as currentInjector, which will be available via `Injector.getCurrentInjector()` call.

For more examples - look at [tests](test)

### token redirect

When want/need re-use another token under different name.

```TypeScript
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
}
```

### multiple tokens

Watch options `{multi: true}` - if specified - all created instances will be returned inside array, even if there is only one instance.  
When not passing `multi: true` (so you expect only one instance), but there are many inject candidates - exception will be thrown in runtime.

```TypeScript
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
  ) {...}
}
```

### multiple tokens - service handlers use-case

Want to have set of services/handlers (hightly lickely with common interface), which can be injectables, which can be used separately.  
But, additionall, can be collected somewhere in single array.

```TypeScript
interface Handler {
  handle() : boolean;
}

Injectable("magicHandler", { // common token, which is multi
  redirect: new ForwardRef(() => ServiceHandlerA),
  multi: true
});
@Injectable() // individual injectable
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
  ) {...}
}
```

### scopes

Prototype

```TypeScript
class SimpleService {}

Injectable("TEST_TOKEN", {
  scope: "prototype",
  factory: () => new SimpleService()
});

const service1 : SimpleService = Inject("TEST_TOKEN");
const service2 : SimpleService = Inject("TEST_TOKEN"); // prototype --> each time new instance
```

Caching

```TypeScript
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
```

---

License MIT
