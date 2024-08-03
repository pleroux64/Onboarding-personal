import { useEffect } from 'react';

import { applyActionCode } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { AUTH_MODES } from '@/constants/auth';
import ALERT_COLORS from '@/constants/notification';
import ROUTES from '@/constants/routes';

import { setEmailVerified, setLoading } from '@/redux/slices/authSlice';
import { auth } from '@/redux/store';
import fetchUserData from '@/redux/thunks/user';

const redirectRegex = /\/redirect.*/;

const useRedirect = (
  firestore,
  functions,
  handleOpenSnackBar,
  onboardingFlag
) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { route, asPath, query } = router;
  const { data: authData, loading } = useSelector((state) => state.auth);

  const fetchUserRelatedData = async (id) => {
    const user = await dispatch(fetchUserData({ firestore, id })).unwrap();
    return user;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAuthUrl = [
      ROUTES.SIGNIN,
      ROUTES.SIGNUP,
      ROUTES.PRIVACY,
      ROUTES.TERMS,
      ROUTES.PASSWORD_RESET,
    ].includes(route);

    const isRedirectRoute = redirectRegex.test(asPath);
    const isAuthRoute = isAuthUrl || isRedirectRoute;

    if (auth.currentUser) {
      if (isRedirectRoute) {
        dispatch(setLoading(false));
        return;
      }

      if (!auth.currentUser.emailVerified) {
        if (!isAuthUrl) {
          router.push(ROUTES.SIGNIN);
          return;
        }
        return;
      }

      fetchUserRelatedData(auth.currentUser.uid);

      if (onboardingFlag) {
        router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
      } else if (isAuthUrl) {
        router.push(ROUTES.HOME);
      }

      return;
    }

    if (!isAuthRoute && !loading) {
      router.push(ROUTES.SIGNIN);
    }
  }, [authData]);

  useEffect(() => {
    const isRedirectRoute = redirectRegex.test(asPath);

    if (isRedirectRoute) {
      const handleVerifyEmail = async () => {
        try {
          const { oobCode } = query;
          await applyActionCode(auth, oobCode);
          dispatch(setEmailVerified(true));

          router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
        } catch (error) {
          handleOpenSnackBar(ALERT_COLORS.ERROR, 'Unable to verify email');
          router.push(ROUTES.SIGNUP);
          throw new Error(error);
        }
      };

      const { mode, oobCode } = query;

      if (mode === AUTH_MODES.PASSWORD_RESET) {
        router.replace(`${ROUTES.PASSWORD_RESET}?oobCode=${oobCode}`);
        return;
      }

      if (mode === AUTH_MODES.VERIFY_EMAIL) {
        if (auth.currentUser?.emailVerified) {
          router.push(ROUTES.ONBOARDING.replace('[onboardingId]', '0'));
          return;
        }
        handleVerifyEmail();
      }
    }
  }, [query]);
};

export default useRedirect;
