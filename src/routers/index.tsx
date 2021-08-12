import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  Redirect,
} from 'react-router-dom';
import Loadable from '@/routers/loadable';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, accountStoreState } from '@/store/accountInterface';
import Login from '@/pages/login';
import ResourcePage from '@/pages/resource';
import Strategy from '@/pages/warning/strategy';
import Profile from '@/pages/account/profile';
// const Dashboard = React.lazy(() => import('@/pages/dashboard'));
import Dashboard from '@/pages/dashboard';
import Chart from '@/pages/chart';
import DashboardDetail from '@/pages/dashboard/detail';
import Manage from '@/pages/manage';
import Explore from '@/pages/metric/explorer';
import IndicatorPage from '@/pages/monitor/indicator';
import StrategyOperate from '@/pages/warning/strategy/operate';
import Shield from '@/pages/warning/shield';
import AddShield from '@/pages/warning/shield/add';
import ShieldDetail from '@/pages/warning/shield/detail';
import Event from '@/pages/event';
import EventDetail from '@/pages/event/detail';
import Overview from '@/pages/overview';

export default function Content() {
  let { profile } = useSelector<RootState, accountStoreState>(
    (state) => state.account,
  );
  const location = useLocation();
  const dispatch = useDispatch();
  if (
    !profile.id &&
    location.pathname != '/login' &&
    !location.pathname.startsWith('/chart/')
  ) {
    dispatch({ type: 'account/getProfile' });
  }

  // this is a workaround for D3Chart, it's destroy function has some problem
  useEffect(() => {
    const chartTooltip = document.querySelectorAll('.ts-graph-tooltip');
    if (chartTooltip.length > 0) {
      chartTooltip.forEach((item) => {
        item.remove();
      });
    }
  }, [location]);

  return (
    <div className='content'>
      <Switch>
        <Route path='/login' component={Login} exact />
        <Route exact path='/overview' component={Overview} />
        <Route path='/metric/explorer' component={Explore} exact />
        <Route path='/account/profile/:tab' component={Profile} />
        <Route path='/manage/:type' component={Manage} />
        <Route path='/dashboard/:id' component={DashboardDetail} />
        <Route path='/dashboard' component={Dashboard} />
        <Route path='/chart/:ids' component={Chart} />
        <Route path='/resource/:id?' component={ResourcePage} />
        <Route path='/indicator' component={IndicatorPage} />
        <Route
          exact
          path='/strategy/add/:group_id'
          component={StrategyOperate}
        />
        <Route exact path='/strategy/edit/:id' component={StrategyOperate} />
        <Route exact path='/strategy/:id?' component={Strategy} />
        <Route exact path='/shield' component={Shield} />
        <Route exact path='/shield/add/:from?' component={AddShield} />
        <Route exact path='/shield/detail/:id' component={ShieldDetail} />
        <Route exact path='/event' component={Event} />
        <Route exact path='/event/:id' component={EventDetail} />
        <Route path='/' exact>
          <Redirect to='/overview' />
        </Route>
      </Switch>
    </div>
  );
}
