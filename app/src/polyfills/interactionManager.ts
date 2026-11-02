/**
 * React Native 0.88 retire InteractionManager en __DEV__.
 * @react-navigation/stack y accède encore → polyfill minimal.
 */
import { Platform } from 'react-native';

type Task = (() => unknown) | { gen: () => Promise<unknown>; name?: string };

const shim = {
  createInteractionHandle: (): number => 1,
  clearInteractionHandle: (_handle?: number): void => {},
  runAfterInteractions: (task?: Task) => {
    const run = () => {
      if (typeof task === 'function') return task();
      if (task && typeof task.gen === 'function') return task.gen();
      return undefined;
    };
    const promise = Promise.resolve().then(run);
    return {
      then: promise.then.bind(promise),
      done: () => {
        void promise;
      },
      cancel: () => {},
    };
  },
  setDeadline: (_deadline: number): void => {},
};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native') as Record<string, unknown>;
  Object.defineProperty(RN, 'InteractionManager', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: shim,
  });
} catch {
  if (Platform.OS !== 'web') {
    console.warn('[polyfill] Impossible de patcher InteractionManager');
  }
}
