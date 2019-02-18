import React from 'react';
import './index.less';

interface Props {
  height: number;
  units?: 'px' | 'rem';
}

const STATE = {
  isOverflowing: false,
  isShowing: false,
  hasChecked: false,
};
type State = typeof STATE;

// very basic "show more" wrapper component, doesn't yet support
// - window resize height changes
// - using the parent or natural height as the desired height
export class ShowMore extends React.Component<Props, State> {
  state = STATE;
  wrapper: null | HTMLDivElement = null;
  componentDidMount() {
    this.updateOverflow();
  }
  componentDidUpdate(_: Props, s: State) {
    const isShowingChange = s.isShowing !== this.state.isShowing;
    const reset = !isShowingChange && (s.hasChecked && this.state.hasChecked);
    const mustCheck = s.hasChecked && !this.state.hasChecked;
    if (reset) {
      this.setState(STATE);
    }
    if (mustCheck) {
      this.updateOverflow();
    }
  }
  render() {
    const p = this.props;
    const s = this.state;
    const maxHeight = `${p.height}${p.units || 'px'}`;
    const style = !s.hasChecked || (s.isOverflowing && !s.isShowing) ? { maxHeight } : {};

    return (
      <div style={style} className="ShowMore" ref={d => (this.wrapper = d)}>
        {p.children}
        {s.isOverflowing &&
          !s.isShowing && (
            <div className="ShowMore-controls">
              <a onClick={() => this.setState({ isShowing: true })}>show more</a>
            </div>
          )}
        {s.isOverflowing &&
          s.isShowing && (
            <div className="ShowMore-controls">
              <a onClick={() => this.setState({ isShowing: false })}>hide</a>
            </div>
          )}
      </div>
    );
  }
  private updateOverflow = () => {
    const w = this.wrapper;
    if (!w) return;
    // natural hight is ok
    if (w.clientHeight < this.props.height) {
      this.setState({ isOverflowing: false, hasChecked: true });
      return;
    }
    // tall, let us check...
    this.setState({ isOverflowing: w.scrollHeight > w.clientHeight, hasChecked: true });
  };
}

export default ShowMore;
