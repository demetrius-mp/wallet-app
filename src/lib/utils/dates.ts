import 'dayjs/locale/pt-br';

import { CalendarDate } from '@internationalized/date';
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
