import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import classnames from 'classnames';
import BasicHead from 'components/BasicHead';
import Header from 'components/Header';
import Footer from 'components/Footer';
import { AppState } from 'store/reducers';
import './index.less';

interface StateProps {
  authUser: AppState['auth']['user'];
}

export interface TemplateProps {
  title: string;
  isHeaderTransparent?: boolean;
  isFullScreen?: boolean;
  hideFooter?: boolean;
  requiresAuth?: boolean;
}

type Props = StateProps & TemplateProps;

class Template extends React.PureComponent<Props> {
  render() {
    const {
      children,
      title,
      isHeaderTransparent,
      isFullScreen,
      hideFooter,
      requiresAuth,
      authUser,
    } = this.props;

    let content = children;
    let isCentered = false;
    if (requiresAuth) {
      if (!authUser) {
        isCentered = true;
        content = (
          <div>
            Login required. <br /> TODO: links or redirect
          </div>
        );
      }
    }

    const className = classnames(
      'Template',
      isFullScreen && 'is-fullscreen',
      isCentered && 'is-centered',
    );
    return (
      <BasicHead title={title}>
        <div className={className}>
          <Header isTransparent={isHeaderTransparent} />
          <Layout.Content className="Template-content">
            <div className="Template-content-inner">{content}</div>
          </Layout.Content>
          {!hideFooter && <Footer />}
        </div>
      </BasicHead>
    );
  }
}

export default connect<StateProps, {}, TemplateProps, AppState>(state => {
  return {
    authUser: state.auth.user,
  };
})(Template);
