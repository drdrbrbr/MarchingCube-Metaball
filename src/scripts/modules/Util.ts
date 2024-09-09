export const qs = (selector: string, scope: HTMLElement | Document = document) => {
  return scope.querySelector(selector);
}

export const qsa = (selector: string, scope: HTMLElement | Document = document) => {
  return scope.querySelectorAll(selector);
}

export const addClass = (target: HTMLElement, className: string | Array<string>) => {
  if(typeof className === 'string') {
    target.classList.add(className);
  } else if (Array.isArray(className)) {
    className.forEach((className) => {
      target.classList.add(className);
    });
  }
}

export const removeClass = (target: HTMLElement, className: string | Array<string>) => {
  if(typeof className === 'string') {
    target.classList.remove(className);
  } else if (Array.isArray(className)) {
    className.forEach((className) => {
      target.classList.remove(className);
    });
  }
}

export const toggleClass = (target: HTMLElement, className: string) => {
  target.classList.toggle(className);
}

export const hasClass = (target: HTMLElement, className: string) => {
  return target.classList.contains(className);
}

export const random = (max: number, min: number = 0) => {
  return Math.random() * (max - min) + min;
}

export const randomInt = (max: number, min: number = 0) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomBool = (rate = .5) => {
  return Math.random() < rate;
}

export const shuffleArr = (arr: any[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const randomPickArr = (arr: any[], num: number = -1) => {
  const result = [];
  const pickedIndices = new Set();
  const arrayLength = arr.length;
  num = num < 0 ? Math.floor(Math.random() * arrayLength) : num;
  const numSamples = Math.min(num, arrayLength); // 抽出する要素数が配列の長さを超えないようにする

  while (pickedIndices.size < numSamples) {
    const randomIndex = Math.floor(Math.random() * arrayLength);
    if (!pickedIndices.has(randomIndex)) {
      pickedIndices.add(randomIndex);
      result.push(arr[randomIndex]);
    }
  }

  return result;
}

export class TimeoutManager {
  private static timeouts: number[] = [];

  static setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      TimeoutManager.clearTimeout(id);
      callback();
    }, delay);
    TimeoutManager.timeouts.push(id);
    return id;
  }

  static clearTimeout(id: number) {
    const index = TimeoutManager.timeouts.indexOf(id);
    if (index !== -1) {
      TimeoutManager.timeouts.splice(index, 1);
    }
    window.clearTimeout(id);
  }

  static clearAllTimeouts() {
    TimeoutManager.timeouts.forEach(id => window.clearTimeout(id));
    TimeoutManager.timeouts = [];
  }
}

type GenericEventListener<E extends Event> = (event: E) => void;

interface EventRecord<E extends Event> {
  target: EventTarget;
  type: string;
  listener: GenericEventListener<E>;
}

export class EventManager {
  private events: EventRecord<Event>[] = [];

  add<E extends Event>(target: EventTarget, type: string, listener: GenericEventListener<E>): void {
    target.addEventListener(type, listener as EventListener);
    this.events.push({ target, type, listener: listener as GenericEventListener<Event> });
  }

  remove<E extends Event>(target: EventTarget, type: string, listener: GenericEventListener<E>): void {
    target.removeEventListener(type, listener as EventListener);
    this.events = this.events.filter(event => event.target !== target || event.type !== type || event.listener !== listener);
  }

  removeAllForTarget(target: EventTarget): void {
    this.events = this.events.filter(event => {
      if (event.target === target) {
        target.removeEventListener(event.type, event.listener as EventListener);
        return false;
      }
      return true;
    });
  }

  removeAll(): void {
    this.events.forEach(({ target, type, listener }) => target.removeEventListener(type, listener as EventListener));
    this.events = [];
  }
}