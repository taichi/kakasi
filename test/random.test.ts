// tslint:disable-next-line:import-name
import { make } from '../src/random';

test('make', () => {
    const r = make();
    expect(r).toBeTruthy();

    expect(0 < r()).toBe(true);
});
