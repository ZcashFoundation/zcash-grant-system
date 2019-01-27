import React from 'react';
import { hot } from 'react-hot-loader';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Layout, Menu, Icon, Alert } from 'antd';
import './index.less';
import store from 'src/store';
import { view } from 'react-easy-state';

const { Content, Sider } = Layout;

type Props = RouteComponentProps<any>;

class Template extends React.Component<Props> {
  render() {
    const { pathname } = this.props.location;
    return (
      <Layout className="Template">
        {store.generalError.length > 0 && (
          <div className="Template-errors">
            {store.generalError.map((e, i) => (
              <Alert
                key={i}
                message={e}
                type="error"
                closable={true}
                onClose={() => store.removeGeneralError(i)}
              />
            ))}
          </div>
        )}
        <Sider className="Template-sider">
          <div className="Template-sider-logo">ZF Grants</div>
          <Menu theme="dark" mode="inline" selectedKeys={[pathname]}>
            <Menu.Item key="/">
              <Link to="/">
                <Icon type="home" />
                <span className="nav-text">home</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/users">
              <Link to="/users">
                <Icon type="user" />
                <span className="nav-text">users</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/proposals">
              <Link to="/proposals">
                <Icon type="file" />
                <span className="nav-text">proposals</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/emails">
              <Link to="/emails">
                <Icon type="mail" />
                <span className="nav-text">emails</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="logout" onClick={store.logout}>
              <Icon type="logout" />
              <span className="nav-text">logout</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="Template-layout">
          <Content className="Template-layout-content">{this.props.children}</Content>
        </Layout>
      </Layout>
    );
  }
}

const ConnectedTemplate = withRouter(view(Template));
export default hot(module)(ConnectedTemplate);
