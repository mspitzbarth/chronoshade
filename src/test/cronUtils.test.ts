
import * as assert from 'assert';
import * as cronUtils from '../cronUtils';

suite('Cron Utils Test Suite', () => {

    test('validateCronExpression - Valid Expressions', () => {
        assert.strictEqual(cronUtils.validateCronExpression('0 6 * * *'), true);
        assert.strictEqual(cronUtils.validateCronExpression('*/15 * * * *'), true);
        assert.strictEqual(cronUtils.validateCronExpression('0 12 1 * *'), true);
        assert.strictEqual(cronUtils.validateCronExpression('0 0 1 1 *'), true);
    });

    test('validateCronExpression - Invalid Expressions', () => {
        assert.strictEqual(cronUtils.validateCronExpression(''), false);
        assert.strictEqual(cronUtils.validateCronExpression('invalid'), false);
        assert.strictEqual(cronUtils.validateCronExpression('* * * *'), false); // Too few fields
        assert.strictEqual(cronUtils.validateCronExpression('* * * * * *'), false); // Too many fields
        assert.strictEqual(cronUtils.validateCronExpression('60 * * * *'), false); // Minute out of range
    });

    test('getLastCronOccurrence - Basic', () => {
        const now = new Date('2023-01-01T12:00:00');
        const expression = '0 6 * * *'; // 6 AM daily

        const lastOccurrence = cronUtils.getLastCronOccurrence(expression, now);
        assert.ok(lastOccurrence);
        assert.strictEqual(lastOccurrence?.getHours(), 6);
        assert.strictEqual(lastOccurrence?.getMinutes(), 0);
        assert.strictEqual(lastOccurrence?.getDate(), 1);
    });

    test('getLastCronOccurrence - Yesterday', () => {
        const now = new Date('2023-01-02T05:00:00'); // 5 AM
        const expression = '0 6 * * *'; // 6 AM daily

        // Should find occurrence from yesterday (Jan 1st 6 AM)
        const lastOccurrence = cronUtils.getLastCronOccurrence(expression, now);
        assert.ok(lastOccurrence);
        assert.strictEqual(lastOccurrence?.getHours(), 6);
        assert.strictEqual(lastOccurrence?.getMinutes(), 0);
        assert.strictEqual(lastOccurrence?.getDate(), 1);
    });

});
