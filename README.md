[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

# Lightweight IoC (Inversion of Control) and DI (Dependency Injection) library.

Inspired by Angular and Spring Frameworks.  
Injectors serve function of IoC containers.  
Injectors have hierarchy - everything known on parent level will be available for DI at child level.  
Child injectors can override parent tokens for his level and for nested, if any.  
Injectors can be detached from root.  
This library doesn't use reflect-metadata, the solution is prototype-based.

## Installation

npm

```shell
npm i @stnekroman/inversityts
```

yarn

```shell
yarn add @stnekroman/inversityts
```

And in your tsconfig.json you need to set

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## Basic Usage

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

When constructor has dependencies

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

Hide implementation from consumer's eyes

```TypeScript
const TYPES = {
  SERVICE_A: Symbol("ServiceA"),
  SERVICE_B: Symbol("ServiceB"),
};

interface ServiceA {...}
interface ServiceB {...}

class ServiceAImpl implements ServiceA {...}
class ServiceBImpl implements ServiceB {...}

class WithDependencies {
  constructor(
    @Inject.Param(TYPES.SERVICE_A) serviceA : ServiceA,
    @Inject.Param(TYPES.SERVICE_B) serviceB : ServiceB
  ) {...}
}

const ins = Injector.getCurrentInjector().createInstance(WithDependencies);
```

Manual definition of tokens
