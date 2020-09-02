import { world } from './helper';
import { range } from 'd3-array';

export function helloWorld() {
  return 'hello-' + world() + range(10).toString();
}

export * from './helper';
