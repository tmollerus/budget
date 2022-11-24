import { Icon } from '@blueprintjs/core';
import { useStyles } from './Profile.styles';
import { Link } from 'react-router-dom';
import { APP } from '../constants/app';
import { useOktaAuth, withOktaAuth } from '@okta/okta-react';
import { useEffect, useState } from 'react';
import { getGravatarHash } from '../utils/format';
import { UserInfo } from '../types';
import { UserClaims } from '@okta/okta-auth-js';

const Profile = (props: any) => {
  const classes = useStyles();
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>();

  useEffect(() => {
    if (authState?.isAuthenticated) {
      oktaAuth.getUser().then((info: UserClaims) => {
        setUserInfo({ name: info.name || '', email: info.email || ''});
      });
    }
  }, [authState, oktaAuth]);

  return (
      <div className={classes.profile}>
        <img
          className={classes.userImage}
          src={`https://www.gravatar.com/avatar/${getGravatarHash(
            userInfo?.email || ''
          )}`}
          alt={userInfo?.name}
        />
        <div className={classes.userStatus}>
          Logged in as:
          <br />
          <span className={classes.userName}>{userInfo?.name}</span>
          <Link className={classes.logout} to={APP.ROUTES.LOGOUT}>
            <Icon icon="log-out" size={12} />
          </Link>
        </div>
      </div>
  );
};

export default withOktaAuth(Profile);
