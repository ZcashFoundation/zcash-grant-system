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
import loadable from '@loadable/component';
import AuthRoute from 'components/AuthRoute';
import Template, { TemplateProps } from 'components/Template';
import ErrorWrap from 'components/ErrorWrap';
import Loader from 'components/Loader';
import 'styles/style.less';

// wrap components in loadable...import & they will be split
// Make sure you specify chunkname! Must replace slashes with dashes.
const opts = { fallback: <Loader size="large" /> };
const Home = loadable(() => import('pages/index'), opts);
const Create = loadable(() => import('pages/create'), opts);
const CreateRequest = loadable(() => import('pages/create-request'), opts);
const RequestEdit = loadable(() => import('pages/request-edit'), opts);
const ProposalEdit = loadable(() => import('pages/proposal-edit'), opts);
const Proposals = loadable(() => import('pages/proposals'), opts);
const Proposal = loadable(() => import('pages/proposal'), opts);
const Guide = loadable(() => import('pages/guide'), opts);
const Ccr = loadable(() => import('pages/ccr'), opts);
const Auth = loadable(() => import('pages/auth'));
const SignOut = loadable(() => import('pages/sign-out'), opts);
const Profile = loadable(() => import('pages/profile'), opts);
const Settings = loadable(() => import('pages/settings'), opts);
const Exception = loadable(() => import('pages/exception'), opts);
const Tos = loadable(() => import('pages/tos'));
const About = loadable(() => import('pages/about'), opts);
const Privacy = loadable(() => import('pages/privacy'), opts);
const Contact = loadable(() => import('pages/contact'), opts);
const CodeOfConduct = loadable(() => import('pages/code-of-conduct'), opts);
const VerifyEmail = loadable(() => import('pages/email-verify'), opts);
const Callback = loadable(() => import('pages/callback'), opts);
const RecoverEmail = loadable(() => import('pages/email-recover'), opts);
const UnsubscribeEmail = loadable(() => import('pages/email-unsubscribe'), opts);
const ArbiterEmail = loadable(() => import('pages/email-arbiter'), opts);
const RFP = loadable(() => import('pages/rfp'), opts);
const RFPs = loadable(() => import('pages/rfps'), opts);

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
    // Create request
    route: {
      path: '/create-request',
      component: CreateRequest,
    },
    template: {
      title: 'Create a Request',
    },
    onlyLoggedIn: true,
  },
  {
    // Request edit page
    route: {
      path: '/ccrs/:id/edit',
      component: RequestEdit,
    },
    template: {
      title: 'Edit Request',
      isFullScreen: true,
      hideFooter: true,
    },
    onlyLoggedIn: true,
  },
  {
    // Request view page
    route: {
      path: '/ccrs/:id',
      component: Ccr,
    },
    template: {
      title: 'View Request',
      isFullScreen: true,
      hideFooter: true,
    },
    onlyLoggedIn: true,
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
    // RFP list page,
    route: {
      path: '/requests',
      component: RFPs,
      exact: true,
    },
    template: {
      title: 'Requests',
    },
  },
  {
    // RFP detail page
    route: {
      path: '/requests/:id',
      component: RFP,
    },
    template: {
      title: 'Request',
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
    // Terms of Service page
    route: {
      path: '/guide',
      component: Guide,
      exact: true,
    },
    template: {
      title: 'Guide',
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
    // Arbiter email
    route: {
      path: '/email/arbiter',
      component: ArbiterEmail,
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
        return (
          <AuthRoute
            key={route.path as string}
            onlyLoggedOut={onlyLoggedOut}
            {...route}
          />
        );
      } else {
        return <Route key={route.path as string} {...route} />;
      }
    });

    return (
      <Template {...currentRoute.template}>
        <ErrorWrap key={currentRoute.route.path as string}>
          <Switch>{routeComponents}</Switch>
        </ErrorWrap>
      </Template>
    );
  }
}

const RouterAwareRoutes = withRouter(Routes);
export default hot(module)(RouterAwareRoutes);
