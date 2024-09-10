import { Inject, Injectable } from "../src";


@Injectable()
class SimpleService {

}


class WithDependencies {
  private readonly simple = Inject(SimpleService);

  constructor() {

  }
}
