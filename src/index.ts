import { world } from './helper';

export function helloWorld() {
  return 'hello-' + world();
}

export * from './helper';
