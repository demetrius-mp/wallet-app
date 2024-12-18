import 'dayjs/locale/pt-br';

import { CalendarDate, getLocalTimeZone } from '@internationalized/date';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.locale('pt-br');

export const dates = dayjs;

export function calendarDateToDayjs(date: CalendarDate) {
	return dates(date.toDate(getLocalTimeZone())).utc(true);
}

export function dayjsToCalendarDate(date: dayjs.Dayjs): CalendarDate {
	return new CalendarDate(date.year(), date.month() + 1, date.date());
}

export function checkDateIsValid(d: string): boolean {
	const parsed = dates(d, 'YYYY-MM-DD', true);

	return parsed.isValid();
}

export function transformMonthYearDate(d: string): Date {
	const parsed = dates(d, 'YYYY-MM-DD', true);

	if (!parsed.isValid()) {
		throw new Error('Invalid date');
	}

	return parsed.utc(true).startOf('month').toDate();
}

export function transformDayMonthYearDate(d: string): Date {
	const parsed = dates(d, 'YYYY-MM-DD', true);

	if (!parsed.isValid()) {
		throw new Error('Invalid date');
	}

	return parsed.utc(true).toDate();
}

export function getDatesDiffInMonths(d1: Date, d2: Date) {
	const start = dates.utc(d1).startOf('month');
	const end = dates.utc(d2).startOf('month');

	if (start.isBefore(end)) {
		return end.diff(start, 'month');
	}

	return start.diff(end, 'month');
}
