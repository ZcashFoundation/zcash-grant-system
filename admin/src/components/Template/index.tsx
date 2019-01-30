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
    const pathbase = pathname.split('/')[1] || '/';
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
          <Menu theme="dark" mode="inline" selectedKeys={[pathbase]}>
            <Menu.Item key="/">
              <Link to="/">
                <Icon type="home" />
                <span className="nav-text">Home</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="users">
              <Link to="/users">
                <Icon type="user" />
                <span className="nav-text">Users</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="proposals">
              <Link to="/proposals">
                <Icon type="file" />
                <span className="nav-text">Proposals</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="rfps">
              <Link to="/rfps">
                <Icon type="notification" />
                <span className="nav-text">RFPs</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="emails">
              <Link to="/emails">
                <Icon type="mail" />
                <span className="nav-text">Emails</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="logout" onClick={store.logout}>
              <Icon type="logout" />
              <span className="nav-text">Logout</span>
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
