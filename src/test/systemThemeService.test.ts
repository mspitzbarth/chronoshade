import * as assert from 'assert';
import { parseWindowsLightThemeValue, parseGnomeColorScheme, parseGnomeGtkTheme, classifyMacDefaultsFailure } from '../services/systemThemeService';

suite('System Theme Service Test Suite', () => {

    test('parseWindowsLightThemeValue - Dark mode (0x0)', () => {
        const stdout = `
HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize
    AppsUseLightTheme    REG_DWORD    0x0
`;
        assert.strictEqual(parseWindowsLightThemeValue(stdout), 'dark');
    });

    test('parseWindowsLightThemeValue - Light mode (0x1)', () => {
        const stdout = `
HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize
    AppsUseLightTheme    REG_DWORD    0x1
`;
        assert.strictEqual(parseWindowsLightThemeValue(stdout), 'light');
    });

    test('parseWindowsLightThemeValue - Unrecognized output', () => {
        assert.strictEqual(parseWindowsLightThemeValue('ERROR: The system was unable to find the specified registry key.'), null);
    });

    test('parseGnomeColorScheme - prefer-dark', () => {
        assert.strictEqual(parseGnomeColorScheme("'prefer-dark'\n"), 'dark');
    });

    test('parseGnomeColorScheme - default (light)', () => {
        assert.strictEqual(parseGnomeColorScheme("'default'\n"), 'light');
    });

    test('parseGnomeColorScheme - empty output', () => {
        assert.strictEqual(parseGnomeColorScheme(''), null);
    });

    test('parseGnomeGtkTheme - dark variant', () => {
        assert.strictEqual(parseGnomeGtkTheme("'Adwaita-dark'\n"), 'dark');
    });

    test('parseGnomeGtkTheme - light theme', () => {
        assert.strictEqual(parseGnomeGtkTheme("'Adwaita'\n"), 'light');
    });

    test('classifyMacDefaultsFailure - confirmed Light mode (key genuinely missing)', () => {
        const result = classifyMacDefaultsFailure({
            code: 1,
            stderr: 'The domain/default pair of (kCFPreferencesAnyApplication, AppleInterfaceStyle) does not exist'
        });
        assert.strictEqual(result, 'light');
    });

    test('classifyMacDefaultsFailure - timeout is inconclusive, not Light', () => {
        const result = classifyMacDefaultsFailure({ killed: true, signal: 'SIGTERM', code: null, stderr: '' });
        assert.strictEqual(result, null);
    });

    test('classifyMacDefaultsFailure - unexpected error is inconclusive, not Light', () => {
        const result = classifyMacDefaultsFailure({ code: 127, stderr: 'command not found' });
        assert.strictEqual(result, null);
    });
});
