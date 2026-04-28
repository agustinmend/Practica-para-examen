import { AppData } from "../types/appData";

type Observer = (state: AppData) => void;

export class Store {
  private state: AppData;
  private observers: Observer[] = [];

  constructor(initialState: AppData) {
    this.state = this.createReactiveProxy(initialState);
  }
  
  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  private notify(): void {
    this.observers.forEach(observer => observer(this.state));
  }

  private createReactiveProxy<T extends object>(target: T): T {
    const handler: ProxyHandler<any> = {
      get: (obj, prop) => {
        const val = Reflect.get(obj, prop);
        if (typeof val === 'object' && val !== null) {
          return new Proxy(val, handler);
        }
        return val;
      },
      set: (obj, prop, value) => {
        const result = Reflect.set(obj, prop, value);
        if (prop !== 'length') {
          this.notify();
        }
        return result;
      }
    };

    return new Proxy(target, handler);
  }

  getState(): AppData {
    return this.state;
  }
}