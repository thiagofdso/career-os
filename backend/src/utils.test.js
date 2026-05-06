import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseTask } from './utils.js';

describe('parseTask utility', () => {
  it('should return undefined if no task is provided', () => {
    assert.strictEqual(parseTask(undefined), undefined);
    assert.strictEqual(parseTask(null), null);
  });

  it('should return a task with needsApproval as boolean', () => {
    const task1 = parseTask({ needsApproval: 1 });
    assert.strictEqual(task1.needsApproval, true);

    const task2 = parseTask({ needsApproval: 0 });
    assert.strictEqual(task2.needsApproval, false);

    const task3 = parseTask({ needsApproval: undefined });
    assert.strictEqual(task3.needsApproval, false);
  });

  it('should parse tags if provided as JSON string', () => {
    const task = parseTask({ tags: '["urgent", "backend"]' });
    assert.deepStrictEqual(task.tags, ['urgent', 'backend']);
  });

  it('should keep tags as undefined if not provided', () => {
    const task = parseTask({ tags: null });
    assert.strictEqual(task.tags, undefined);
  });

  it('should parse metadata if provided as JSON string', () => {
    const task = parseTask({ metadata: '{"key": "value"}' });
    assert.deepStrictEqual(task.metadata, { key: 'value' });
  });

  it('should keep metadata as undefined if not provided', () => {
    const task = parseTask({ metadata: null });
    assert.strictEqual(task.metadata, undefined);
  });

  it('should correctly parse a complete task object', () => {
    const rawTask = {
      id: 1,
      title: 'Complete test task',
      needsApproval: 1,
      tags: '["test"]',
      metadata: '{"priority": "high"}',
      status: 'pending'
    };

    const parsedTask = parseTask(rawTask);

    assert.deepStrictEqual(parsedTask, {
      id: 1,
      title: 'Complete test task',
      needsApproval: true,
      tags: ['test'],
      metadata: { priority: 'high' },
      status: 'pending'
    });
  });

  it('should throw an error for invalid tags JSON', () => {
    assert.throws(() => {
      parseTask({ tags: 'invalid-json' });
    }, SyntaxError);
  });

  it('should throw an error for invalid metadata JSON', () => {
    assert.throws(() => {
      parseTask({ metadata: 'invalid-json' });
    }, SyntaxError);
  });
});
