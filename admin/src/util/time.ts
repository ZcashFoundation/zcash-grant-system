import moment from 'moment';

const DATE_FMT_STRING = 'MM/DD/YYYY h:mm a';

export const formatDateSeconds = (s: number) => {
  return moment(s * 1000).format(DATE_FMT_STRING);
};
