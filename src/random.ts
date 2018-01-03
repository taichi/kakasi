// tslint:disable-next-line:no-require-imports import-name
import MersenneTwister = require('mersenne-twister');

export const KEY = 'random';

/**
 * generates a random number on [0,0xffffffff]-interval
 */
export type Random = () => number;

export function make(): Random {
    const seed = new MersenneTwister();
    const mt = new MersenneTwister(seed.random());

    return () => mt.random_int();
}
