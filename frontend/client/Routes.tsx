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
const VerifyEmail = loadable(() => import('pages/email-verify'));

import 'styles/style.less';

interface RouteConfig extends RouteProps {
  route: RouteProps;
  template: TemplateProps;
  requiresWeb3?: boolean;
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
      isFullScreen: true,
      hideFooter: true,
      requiresWeb3: true,
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
      requiresWeb3: true,
    },
  },
  {
    // Proposal detail page
    route: {
      path: '/proposals/:id',
      component: Proposal,
    },
    template: {
      title: 'Proposal',
      requiresWeb3: true,
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
    // Sign in / sign up
    route: {
      path: '/auth',
      component: Auth,
      exact: true,
    },
    template: {
      title: 'Sign in',
    },
    onlyLoggedOut: true,
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
