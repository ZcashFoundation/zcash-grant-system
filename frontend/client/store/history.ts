import { createBrowserHistory, createMemoryHistory } from 'history';

const history = (() => {
  if (typeof window === 'undefined') {
    return createMemoryHistory();
  } else {
    return createBrowserHistory();
  }
})();

export default history;
