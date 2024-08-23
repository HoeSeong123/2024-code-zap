import { createBrowserRouter } from 'react-router-dom';

import { Layout } from '@/components';
import {
  TemplatePage,
  TemplateUploadPage,
  SignupPage,
  LoginPage,
  LandingPage,
  NotFoundPage,
  TemplateExplorePage,
  MyTemplatePage,
} from '@/pages';
import RouteGuard from './RouteGuard';
import { END_POINTS } from './endPoints';

const router = createBrowserRouter([
  {
    errorElement: <NotFoundPage />,
    element: <Layout />,
    children: [
      {
        path: END_POINTS.HOME,
        element: <LandingPage />,
      },
      {
        path: END_POINTS.MY_TEMPLATES,
        element: (
          <RouteGuard isLoginRequired redirectTo={END_POINTS.LOGIN}>
            <MyTemplatePage />
          </RouteGuard>
        ),
      },
      {
        path: END_POINTS.TEMPLATES_EXPLORE,
        element: <TemplateExplorePage />,
      },
      {
        path: END_POINTS.TEMPLATE,
        element: <TemplatePage />,
      },
      {
        path: END_POINTS.TEMPLATES_UPLOAD,
        element: (
          <RouteGuard isLoginRequired redirectTo={END_POINTS.LOGIN}>
            <TemplateUploadPage />
          </RouteGuard>
        ),
      },
      {
        path: END_POINTS.SIGNUP,
        element: (
          <RouteGuard isLoginRequired={false} redirectTo={END_POINTS.HOME}>
            <SignupPage />
          </RouteGuard>
        ),
      },
      {
        path: END_POINTS.LOGIN,
        element: (
          <RouteGuard isLoginRequired={false} redirectTo={END_POINTS.HOME}>
            <LoginPage />
          </RouteGuard>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
