import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation, Redirect } from 'react-router-dom';
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
import Business from '@/pages/manage/business';
import Explore from '@/pages/metric/explorer';
import ObjectExplore from '@/pages/monitor/object';
import IndicatorPage from '@/pages/monitor/indicator';
import StrategyAdd from '@/pages/warning/strategy/add';
import StrategyEdit from '@/pages/warning/strategy/edit';
import Shield from '@/pages/warning/shield';
import AddShield from '@/pages/warning/shield/add';
import ShieldDetail from '@/pages/warning/shield/detail';
import Event from '@/pages/event';
import EventDetail from '@/pages/event/detail';
import Overview from '@/pages/overview';
import historyEvents from '@/pages/historyEvents';
import MonObjectManage from '@/pages/monObjectManage';
import Demo from '@/pages/demo';
import TaskTpl from '@/pages/taskTpl';
import TaskTplAdd from '@/pages/taskTpl/add'

import { dynamicPackages, Entry } from '@/utils';

const Packages = dynamicPackages();
let lazyRoutes = Packages.reduce((result: any, module: Entry) => {
  return (result = result.concat(module.routes));
}, []);

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={(props) => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

export default function Content() {
  let { profile } = useSelector<RootState, accountStoreState>((state) => state.account);
  const location = useLocation();
  const dispatch = useDispatch();
  if (!profile.id && location.pathname != '/login' && !location.pathname.startsWith('/chart/')) {
    dispatch({ type: 'account/getProfile' });
    dispatch({ type: 'common/getClusters' });
    dispatch({ type: 'common/getBusiGroups' });
  }

  // // this is a workaround for D3Chart, it's destroy function has some problem
  // useEffect(() => {
  //   const chartTooltip = document.querySelectorAll('.ts-graph-tooltip');
  //   if (chartTooltip.length > 0) {
  //     chartTooltip.forEach((item) => {
  //       item.remove();
  //     });
  //   }
  // }, [location]);

  return (
    <div className='content'>
      <Switch>
        <Route path='/demo' component={Demo} />
        <Route path='/login' component={Login} exact />
        <Route exact path='/overview' component={Overview} />
        <Route path='/metric/explorer' component={Explore} exact />
        <Route path='/object/explorer' component={ObjectExplore} exact />
        <Route path='/account/profile/:tab' component={Profile} />
        <Route path='/manage/business' component={Business} />
        <Route path='/manage/:type' component={Manage} />
        <Route path='/dashboard/:busiId/:id' component={DashboardDetail} />
        <Route path='/dashboard' component={Dashboard} />
        <Route path='/chart/:ids' component={Chart} />
        <Route path='/resource/:id?' component={ResourcePage} />
        <Route path='/indicator' component={IndicatorPage} />
        <Route path='/history-events' component={historyEvents} />

        <Route exact path='/alert-rules/add/:group_id' component={StrategyAdd} />
        <Route exact path='/alert-rules/edit/:id' component={StrategyEdit} />
        <Route exact path='/alert-rules/:id?' component={Strategy} />
        <Route exact path='/shield' component={Shield} />
        <Route exact path='/shield/add/:from?' component={AddShield} />
        <Route exact path='/shield/detail/:id' component={ShieldDetail} />
        <Route exact path='/event' component={Event} />
        <Route exact path='/event/:id' component={EventDetail} />
        <Route exact path='/event-history/:id' component={EventDetail} />
        <Route exact path='/targets' component={MonObjectManage} />

        <Route exact path="/job-tpls" component={TaskTpl as any} />
        <Route exact path="/job-tpls/add" component={TaskTplAdd as any} />
        {/* <Route exact path="/tpls/:id/detail" component={TaskTplDetail as any} />
        <Route exact path="/tpls/:id/modify" component={TaskTplModify as any} />
        <Route exact path="/tasks" component={Task as any} />
        <Route exact path="/tasks-add" component={TaskAdd as any} />
        <Route exact path="/tasks/:id/result" component={TaskResult as any} />
        <Route exact path="/tasks/:id/detail" component={TaskDetail as any} /> */}
        {lazyRoutes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        {/* <Route path='/' exact>
          <Redirect to='/overview' />
        </Route> */}
      </Switch>
    </div>
  );
}
