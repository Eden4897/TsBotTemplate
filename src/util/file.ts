import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  unlink,
  existsSync
} from 'fs';
import { get } from 'https';
import { bot } from '../index';
import { Client } from 'discord.js'

export class JSONDatabase<T> {
  path: string;
  constructor(path: string) {
    this.path = path;
  }
  read(): T {
    return JSON.parse(readFileSync(this.path).toString());
  }
  write(data: T) {
    writeFileSync(this.path, JSON.stringify(data, null, 4));
    return this.read();
  }
}
export class JSONArray<U> extends JSONDatabase<Array<U>> {
  constructor(path: string, readOnly = false) {
    super(path);
    if (readOnly) {
      this.write = () => {
        throw new Error(`This JSONArray of ${this.path} is readonly.`);
      };
      if (!existsSync(path)) {
        throw new Error(
          `This JSONArray of ${this.path} is readonly yet is not found`
        );
      }
    }
    if (!existsSync(path)) {
      writeFileSync(path, '[]');
    }
    return this;
  }
  at(index: number) {
    return this.read()[index];
  }
  concat(other: Array<U>) {
    return this.write(this.read().concat(other));
  }
  entries() {
    return this.read().entries();
  }
  every(condition: (value: U, index: number, array: Array<U>) => boolean) {
    return this.read().every(condition);
  }
  filter(condition: (value: U, index: number, array: Array<U>) => boolean) {
    return this.read().filter(condition);
  }
  find(condition: (value: U, index: number, array: Array<U>) => boolean) {
    return this.read().find(condition);
  }
  findIndex(condition: (value: U, index: number, array: Array<U>) => boolean) {
    return this.read().findIndex(condition);
  }
  flat() {
    return this.read().flat();
  }
  forEach(callbackfn: (value: U, index: number, array: Array<U>) => void) {
    return this.read().forEach(callbackfn);
  }
  includes(element: U) {
    return this.read().includes(element);
  }
  indexOf(element: U) {
    return this.read().indexOf(element);
  }
  join(seperator?: string) {
    return this.read().join(seperator);
  }
  keys() {
    return this.read().keys;
  }
  lastIndexOf(element: U) {
    return this.read().lastIndexOf(element);
  }
  map(callback: (element: U) => U) {
    return this.read().map(callback);
  }
  pop(write = true) {
    const _ = this.read();
    _.pop();
    if (write) {
      this.write(_);
    }
    return _;
  }
  push(element: U, write = true) {
    const _ = this.read();
    _.push(element);
    if (write) {
      this.write(_);
    }
    return _;
  }
  remove(condition: (element: U) => void, write = true) {
    const _ = this.read();
    _.splice(_.findIndex(condition), 1);
    if (write) {
      this.write(_);
    }
    return _;
  }
  removeAll(condition: (element: U) => void, write = true) {
    const _ = this.read();
    while (_.findIndex(condition) != -1) {
      _.splice(_.findIndex(condition), 1);
    }
    if (write) {
      this.write(_);
    }
    return _;
  }
  reduce(callback: (previousValue: U, currentValue: U, currentIndex: number, array: Array<U>) => U, initialValue: any = null) {
    return this.read().reduce(callback, initialValue);
  }
  reduceRight(callback: (previousValue: U, currentValue: U, currentIndex: number, array: Array<U>) => U, initialValue: any = null) {
    return this.read().reduceRight(callback, initialValue);
  }
  reverse(write = true) {
    const _ = this.read().reverse();
    if (write) {
      this.write(_);
    }
    return _;
  }
  shift(write = true) {
    const _ = this.read()
    _.shift();
    if (write) {
      this.write(_);
    }
    return _;
  }
  slice(start: number = undefined, end: number = undefined, write = true) {
    const _ = this.read().slice(start, end);
    if (write) {
      this.write(_);
    }
    return _;
  }
  some(condition: (value: U, index: number, array: Array<U>) => boolean) {
    return this.read().some(condition);
  }
  sort(compareFn: (a: U, b: U) => number, write = true) {
    const _ = this.read().sort(compareFn);
    if (write) {
      this.write(_);
    }
    return _;
  }
  splice(start: number, deleteCount: number = 0, ...items: Array<U>) {
    return this.read().splice(start, deleteCount, ...items);
  }
  toString() {
    return this.read().toString();
  }
  unshift(items: Array<U>, write = true) {
    const _ = this.read();
    _.unshift(...items);
    if (write) {
      this.write(_);
    }
    return _;
  }
  values() {
    return this.read().values();
  }
}
export class JSONMap extends JSONDatabase<{
  [key: string]: any
}> {
  constructor(path: string, readOnly = false) {
    super(path);
    if (readOnly) {
      this.write = () => {
        throw new Error(`This JSONMap of ${this.path} is readonly.`);
      };
      if (!existsSync(path)) {
        throw new Error(
          `This JSONMap of ${this.path} is readonly yet is not found`
        );
      }
    }
    if (!existsSync(path)) {
      writeFileSync(path, '{}');
    }
    return this;
  }
  set(key: string, value: any) {
    const _ = this.read();
    _[key] = value;
    return this.write(_);
  }
  unset(key: string) {
    const _ = this.read();
    delete _[key];
    return this.write(_);
  }
  get(key: string) {
    return this.read()[key];
  }
  getKey(value: any) {
    return Object.keys(this.read()).find((key) => this.read()[key] === value);
  }
  increment(key: string, amount: number) {
    if (!(key in this.read())) {
      this.set(key, 0);
    }
    if (isNaN(this.read()[key])) {
      throw new Error('Not a number');
    }
    this.set(key, this.get(key) + amount);
  }
  keys() {
    return Object.keys(this.read());
  }
  values() {
    return Object.values(this.read());
  }
  entries() {
    return Object.entries(this.read());
  }
}

export class JSONScheduler extends JSONArray<{
  date: any
  args: Array<string>
}> {
  eventHandler: (bot: Client, ...args: Array<string>) => void;
  constructor(eventHandler: (bot: Client, ...args: Array<string>) => void, path: string = 'schedule.json') {
    super(path);
    this.eventHandler = eventHandler;
    bot.on('ready', async () => {
      await new Promise((_) => setTimeout(_, 1000));
      this.checkEvents();
      setInterval(() => this.checkEvents(), 60 * 1000);
    });
  }
  checkEvents() {
    this.filter(
      (event) => Date.now() >= new Date(event.date).getTime()
    ).forEach((event) => {
      this.eventHandler(bot, ...event.args);
    });
    this.removeAll((event) => Date.now() >= new Date(event.date).getTime());
  }
  schedule(date: Date, ...args: Array<string>) {
    this.push({
      date: date.toString(),
      args
    });
  }
}

export async function download(url: string, dest = url.split('/').pop()) { //destination defaulted to the file name in the url
  return new Promise((res, rej) => {
    let file = createWriteStream(dest);
    get(url, function (response) {
      response.pipe(file);
      file.on('finish', function () {
        res(file.path);
      });
    }).on('error', function (err) {
      unlink(dest, () => rej(err));
    });
  });
}