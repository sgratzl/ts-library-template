import { world } from './helper';
import { range, max } from 'd3-array';

export function helloWorld() {
  return 'hello-' + world() + range(10).toString() + max([10, 100]);
}

export * from './helper';
