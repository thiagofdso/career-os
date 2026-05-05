import test from 'node:test';
import assert from 'node:assert/strict';
import { variants, sizes, baseClasses } from '../src/components/ui/button-styles.ts';

// Mock the cn utility
function mockCn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

function getButtonClasses(variant = 'primary', size = 'md', className = '') {
  return mockCn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );
}

test('Button style definitions', async (t) => {
  await t.test('should have primary variant styles', () => {
    assert.ok(variants.primary.includes('bg-ds-gray-1000'));
  });

  await t.test('should have md size styles', () => {
    assert.ok(sizes.md.includes('px-4'));
  });

  await t.test('class generation logic matches component intent', () => {
    const classes = getButtonClasses('secondary', 'lg', 'extra');
    assert.ok(classes.includes(variants.secondary));
    assert.ok(classes.includes(sizes.lg));
    assert.ok(classes.includes('extra'));
    assert.ok(classes.includes(baseClasses));
  });
});
