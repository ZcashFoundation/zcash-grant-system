import React from 'react';
import { hot } from 'react-hot-loader';
import {
  Switch,
  Route,
  RouteProps,
  RouteComponentProps,
  withRouter,
  matchPath,
} from 'react-router';
import loadable from 'loadable-components';
import AuthRoute from 'components/AuthRoute';
import Template, { TemplateProps } from 'components/Template';

// wrap components in loadable...import & they will be split
const Home = loadable(() => import('pages/index'));
const Create = loadable(() => import('pages/create'));
const ProposalEdit = loadable(() => import('pages/proposal-edit'));
const Proposals = loadable(() => import('pages/proposals'));
const Proposal = loadable(() => import('pages/proposal'));
const Auth = loadable(() => import('pages/auth'));
const SignOut = loadable(() => import('pages/sign-out'));
const Profile = loadable(() => import('pages/profile'));
const Settings = loadable(() => import('pages/settings'));
const Exception = loadable(() => import('pages/exception'));
const Tos = loadable(() => import('pages/tos'));
const About = loadable(() => import('pages/about'));
const Privacy = loadable(() => import('pages/privacy'));
const Contact = loadable(() => import('pages/contact'));
const CodeOfConduct = loadable(() => import('pages/code-of-conduct'));
const VerifyEmail = loadable(() => import('pages/email-verify'));
const Callback = loadable(() => import('pages/callback'));
const RecoverEmail = loadable(() => import('pages/email-recover'));
const UnsubscribeEmail = loadable(() => import('pages/email-unsubscribe'));

import 'styles/style.less';

interface RouteConfig extends RouteProps {
  route: RouteProps;
  template: TemplateProps;
  requiresAuth?: boolean;
  onlyLoggedIn?: boolean;
  onlyLoggedOut?: boolean;
}

const routeConfigs: RouteConfig[] = [
  {
    // Homepage
    route: {
      path: '/',
      component: Home,
      exact: true,
    },
    template: {
      title: 'Home',
      isHeaderTransparent: true,
      isFullScreen: true,
    },
  },
  {
    // Create proposal
    route: {
      path: '/create',
      component: Create,
    },
    template: {
      title: 'Create a Proposal',
    },
    onlyLoggedIn: true,
  },
  {
    // Browse proposals
    route: {
      path: '/proposals',
      component: Proposals,
      exact: true,
    },
    template: {
      title: 'Browse proposals',
    },
  },
  {
    // Proposal edit page
    route: {
      path: '/proposals/:id/edit',
      component: ProposalEdit,
    },
    template: {
      title: 'Edit proposal',
      isFullScreen: true,
      hideFooter: true,
    },
    onlyLoggedIn: true,
  },
  {
    // Proposal detail page
    route: {
      path: '/proposals/:id',
      component: Proposal,
    },
    template: {
      title: 'Proposal',
    },
  },
  {
    // Self profile
    route: {
      path: '/profile',
      component: Profile,
      exact: true,
    },
    template: {
      title: 'Profile',
    },
    onlyLoggedIn: true,
  },
  {
    // Settings page
    route: {
      path: '/profile/settings',
      component: Settings,
      exact: true,
    },
    template: {
      title: 'Settings',
    },
    onlyLoggedIn: true,
  },
  {
    // Terms of Service page
    route: {
      path: '/tos',
      component: Tos,
      exact: true,
    },
    template: {
      title: 'Terms of Service',
    },
    onlyLoggedIn: false,
  },
  {
    // About page
    route: {
      path: '/about',
      component: About,
      exact: true,
    },
    template: {
      title: 'About',
    },
    onlyLoggedIn: false,
  },
  {
    // Privacy page
    route: {
      path: '/privacy',
      component: Privacy,
      exact: true,
    },
    template: {
      title: 'Privacy Policy',
    },
    onlyLoggedIn: false,
  },
  {
    // Contact page
    route: {
      path: '/contact',
      component: Contact,
      exact: true,
    },
    template: {
      title: 'Contact',
    },
    onlyLoggedIn: false,
  },
  {
    // Code of Conduct page
    route: {
      path: '/code-of-conduct',
      component: CodeOfConduct,
      exact: true,
    },
    template: {
      title: 'Code of Conduct',
    },
    onlyLoggedIn: false,
  },
  {
    // User profile
    route: {
      path: '/profile/:id',
      component: Profile,
    },
    template: {
      title: 'Profile',
    },
  },
  {
    // Sign out
    route: {
      path: '/auth/sign-out',
      component: SignOut,
      exact: true,
    },
    template: {
      title: 'Signed out',
    },
  },
  {
    // Sign in / sign up / recover (nested routes)
    route: {
      path: '/auth',
      component: Auth,
    },
    template: {
      title: 'Sign in',
    },
    onlyLoggedOut: true,
  },
  {
    // Verify email
    route: {
      path: '/email/verify',
      component: VerifyEmail,
      exact: true,
    },
    template: {
      title: 'Verify email',
    },
  },
  {
    // Recover email
    route: {
      path: '/email/recover',
      component: RecoverEmail,
      exact: true,
    },
    template: {
      title: 'Recover email',
    },
  },
  {
    // Unsubscribe email
    route: {
      path: '/email/unsubscribe',
      component: UnsubscribeEmail,
      exact: true,
    },
    template: {
      title: 'Unsubscribe email',
    },
  },
  {
    // oauth callbacks
    route: {
      path: '/callback',
      component: Callback,
    },
    template: {
      title: 'OAuth Callback',
    },
  },
  {
    // 404
    route: {
      path: '/*',
      render: () => <Exception code="404" />,
    },
    template: {
      title: 'Page not found',
    },
  },
];

type Props = RouteComponentProps<any>;

class Routes extends React.PureComponent<Props> {
  render() {
    const { pathname } = this.props.location;
    const currentRoute =
      routeConfigs.find(config => !!matchPath(pathname, config.route)) ||
      routeConfigs[routeConfigs.length - 1];
    const routeComponents = routeConfigs.map(config => {
      const { route, onlyLoggedIn, onlyLoggedOut } = config;
      if (onlyLoggedIn || onlyLoggedOut) {
        return <AuthRoute key={route.path} onlyLoggedOut={onlyLoggedOut} {...route} />;
      } else {
        return <Route key={route.path} {...route} />;
      }
    });

    return (
      <Template {...currentRoute.template}>
        <Switch>{routeComponents}</Switch>
      </Template>
    );
  }
}

const RouterAwareRoutes = withRouter(Routes);
export default hot(module)(RouterAwareRoutes);
