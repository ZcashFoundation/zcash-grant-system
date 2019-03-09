import moment from 'moment';

const DATE_FMT_STRING = 'MM/DD/YYYY h:mm a';

export const formatDateSeconds = (s: number) => {
  return moment(s * 1000).format(DATE_FMT_STRING);
};

export const formatDateSecondsFromNow = (s: number) => {
  return moment(s * 1000).fromNow();
};

export const formatDateMs = (s: number) => {
  return moment(s).format(DATE_FMT_STRING);
};

export const formatDurationSeconds = (s: number) => {
  return moment.duration(s, 'seconds').humanize();
};
