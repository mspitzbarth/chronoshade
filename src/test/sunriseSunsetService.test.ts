import * as assert from 'assert';
import { SunriseSunsetService } from '../sunriseSunsetService';

suite('SunriseSunsetService Test Suite', () => {

    test('validateCoordinates - Valid', () => {
        assert.strictEqual(SunriseSunsetService.validateCoordinates(0, 0), true);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(90, 180), true);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(-90, -180), true);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(40.7128, -74.0060), true);
    });

    test('validateCoordinates - Invalid', () => {
        assert.strictEqual(SunriseSunsetService.validateCoordinates(91, 0), false);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(0, 181), false);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(-91, 0), false);
        assert.strictEqual(SunriseSunsetService.validateCoordinates(NaN, 0), false);
    });

    test('getCoordinateValidationError', () => {
        assert.strictEqual(SunriseSunsetService.getCoordinateValidationError(91, 0).length > 0, true);
        assert.strictEqual(SunriseSunsetService.getCoordinateValidationError(0, 181).length > 0, true);
        assert.strictEqual(SunriseSunsetService.getCoordinateValidationError(0, 0), '');
    });

});
