import { helloWorld } from '.';

describe('test', () => {
  test('a', () => {
    expect(helloWorld()).toBe('hello-world');
  });
});
