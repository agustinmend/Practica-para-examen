import { AppData } from "../types/appData";
import { Channel } from "../types/channel";

type Observer = (state: { data: AppData; currentChannelId: string }) => void;

export class Store {
  private data: AppData;
  private currentChannelId: string;
  private observers: Observer[] = [];
  
  private proxyCache = new WeakMap<object, any>();

  constructor(initialData: AppData) {
    this.data = this.createReactiveProxy(initialData);
    this.currentChannelId = "c-general";
  }
  
  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  private notify(): void {
    this.observers.forEach(observer => observer({
      data: this.data,
      currentChannelId: this.currentChannelId
    }));
  }

  private createReactiveProxy<T extends object>(target: T): T {
    const handler: ProxyHandler<any> = {
      get: (obj, prop) => {
        const val = Reflect.get(obj, prop);
        if (typeof val === 'object' && val !== null) {
          if (!this.proxyCache.has(val)) {
            this.proxyCache.set(val, new Proxy(val, handler));
          }
          return this.proxyCache.get(val);
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

  getData(): AppData {
    return this.data;
  }

  getCurrentChannelId(): string {
    return this.currentChannelId;
  }

  getCurrentChannel(): Channel {
    const channel = this.data.channels.find(c => c.id === this.currentChannelId);
    if (!channel) throw new Error(`Canal no encontrado: ${this.currentChannelId}`);
    return channel;
  }
  
  setCurrentChannelId(id: string): void {
    const exists = this.data.channels.some(c => c.id === id);
    if (!exists) throw new Error(`Canal inexistente: ${id}`);
    
    this.currentChannelId = id;
    this.notify(); 
  }
}