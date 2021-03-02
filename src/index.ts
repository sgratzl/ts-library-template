import { range, max } from 'd3-array';
import world from './helper';

export function helloWorld(): string {
  return `hello-${world()}${range(10).toString()}${max([10, 100])}`;
}

export { default as world } from './helper';
