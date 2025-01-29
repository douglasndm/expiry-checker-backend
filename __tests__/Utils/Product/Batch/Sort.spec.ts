import { addDays, subDays, endOfDay } from 'date-fns';

import Batch from '@models/Batch';

import { sortBatchesByExpDate } from '@utils/Product/Batch/Sort';

describe('Sort of batches', () => {
	it('should return sorted batches', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());

		const batch2 = new Batch();
		batch2.exp_date = addDays(endOfDay(new Date()), 7);

		const batch3 = new Batch();
		batch3.exp_date = subDays(endOfDay(new Date()), 7);

		const sortedBatches = sortBatchesByExpDate([batch2, batch3, batch1]);

		expect(sortedBatches[0]).toBe(batch3);
		expect(sortedBatches[1]).toBe(batch1);
		expect(sortedBatches[2]).toBe(batch2);
	});

	it('should sort batches by checked or not', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());
		batch1.status = 'unchecked';

		const batch2 = new Batch();
		batch2.exp_date = addDays(endOfDay(new Date()), 7);
		batch2.status = 'unchecked';

		const batch3 = new Batch();
		batch3.exp_date = subDays(endOfDay(new Date()), 7);
		batch3.status = 'checked';

		const sortedBatches = sortBatchesByExpDate([batch2, batch3, batch1]);

		expect(sortedBatches[0]).toBe(batch1);
		expect(sortedBatches[1]).toBe(batch2);
		expect(sortedBatches[2]).toBe(batch3);
	});

	it('checked batches should be sorted only by date', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());
		batch1.status = 'checked';

		const batch2 = new Batch();
		batch2.exp_date = addDays(endOfDay(new Date()), 7);
		batch2.status = 'checked';

		const batch3 = new Batch();
		batch3.exp_date = subDays(endOfDay(new Date()), 7);
		batch3.status = 'checked';

		const sortedBatches = sortBatchesByExpDate([batch2, batch3, batch1]);

		expect(sortedBatches[0]).toBe(batch3);
		expect(sortedBatches[1]).toBe(batch1);
		expect(sortedBatches[2]).toBe(batch2);
	});

	it('not enough batches to sort should return the original array', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());
		batch1.status = 'unchecked';

		const sortedBatches = sortBatchesByExpDate([batch1]);

		expect(sortedBatches[0]).toBe(batch1);
		expect(sortedBatches.length).toBe(1);
	});

	it('equals batches should be return the original array', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());

		const sortedBatches = sortBatchesByExpDate([batch1, batch1]);

		expect(sortedBatches[0]).toBe(batch1);
		expect(sortedBatches[1]).toBe(batch1);
		expect(sortedBatches.length).toBe(2);
	});

	it('not enough batches to sort should return the original array', () => {
		const batch1 = new Batch();
		batch1.exp_date = endOfDay(new Date());
		batch1.status = 'unchecked';

		const sortedBatches = sortBatchesByExpDate([batch1]);

		expect(sortedBatches[0]).toBe(batch1);
		expect(sortedBatches.length).toBe(1);
	});
});
