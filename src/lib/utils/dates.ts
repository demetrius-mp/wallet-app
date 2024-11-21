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

export function dateToCalendarDate(date: Date) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return new CalendarDate(year, month, day);
}

export function calendarDateToDayjs(date: CalendarDate) {
	return dates(date.toDate(getLocalTimeZone())).utc(true);
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

	const diff = end.diff(start, 'month');

	return diff;
}
