import { useState, useEffect } from 'react';

import { NavLink } from '.';
import { userService } from '../services';
import { common } from '../utils';
import { Link } from './Link';

export { Nav };

const Nav = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const subscription = userService.user.subscribe(x => setUser(x));
    return () => subscription.unsubscribe();
  }, []);

  const logout = () => {
    userService.logout();
  }

  // only show nav when logged in
  // if (common.isEmpty(user)) return null;

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="navbar-nav">
        <NavLink href="/" exact className="nav-item nav-link">Home</NavLink>
        <a onClick={logout} className="nav-item nav-link">Logout</a>
      </div>
    </nav>
  );
}