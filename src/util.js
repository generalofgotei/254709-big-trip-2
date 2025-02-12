import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
dayjs.extend(durationPlugin);

const DATE_FORMAT = 'D MMMM';
const TIME_FORMAT = 'HH:mm';

const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomBoolean = () => Math.random() < 0.5;

const humanizeTaskDueDate = (dueDate) => dueDate ? dayjs(dueDate).format(DATE_FORMAT) : '';
const humanizeTaskDueTime = (dueDate) => dueDate ? dayjs(dueDate).format(TIME_FORMAT) : '';

const getDuration = (start, end) => {
  const duration = dayjs.duration(dayjs(end).diff(dayjs(start)));
  if (duration.days()) {
    return duration.format('DD[d] HH[h] mm[m]');
  }
  if (duration.hours()) {
    return duration.format('HH[h] mm[m]');
  }

  return duration.format('mm[m]');
};

export { getRandomArrayElement, getRandomInt, getRandomBoolean, humanizeTaskDueDate, humanizeTaskDueTime, getDuration, DATE_FORMAT };
