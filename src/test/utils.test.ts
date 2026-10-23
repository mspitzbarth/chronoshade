import * as assert from 'assert';
import { pickThemeFromPool } from '../utils';

suite('Theme Pool Test Suite', () => {

    test('pickThemeFromPool - empty pool uses fallback', () => {
        assert.strictEqual(pickThemeFromPool([], 'Light+', 'Monokai'), 'Light+');
    });

    test('pickThemeFromPool - keeps current theme while it is in the pool', () => {
        for (let i = 0; i < 50; i++) {
            assert.strictEqual(pickThemeFromPool(['A', 'B', 'C'], 'A', 'B'), 'B');
        }
    });

    test('pickThemeFromPool - re-rolls when current theme belongs to the other phase', () => {
        const pick = pickThemeFromPool(['A', 'B'], 'A', 'Night X');
        assert.ok(['A', 'B'].includes(pick));
    });
});
