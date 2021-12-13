import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, useLocation, Redirect } from 'react-router-dom';
import Loadable from '@/routers/loadable';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, accountStoreState } from '@/store/accountInterface';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/login';
import ResourcePage from '@/pages/resource';
import Strategy from '@/pages/warning/strategy';
import Profile from '@/pages/account/profile';
// const Dashboard = React.lazy(() => import('@/pages/dashboard'));
import Dashboard from '@/pages/dashboard';
import Chart from '@/pages/chart';
import DashboardDetail from '@/pages/dashboard/detail';
import Manage from '@/pages/user';
import Groups from '@/pages/user/groups';
import Users from '@/pages/user/users';
import Business from '@/pages/user/business';
import Explore from '@/pages/metric/explorer';
import ObjectExplore from '@/pages/monitor/object';
import IndicatorPage from '@/pages/monitor/indicator';
import StrategyAdd from '@/pages/warning/strategy/add';
import StrategyEdit from '@/pages/warning/strategy/edit';
import Shield from '@/pages/warning/shield';
import AddShield from '@/pages/warning/shield/add';
import ShieldEdit from '@/pages/warning/shield/edit';
import Subscribe from '@/pages/warning/subscribe';
import SubscribeAdd from '@/pages/warning/subscribe/add';
import SubscribeEdit from '@/pages/warning/subscribe/edit';
import Event from '@/pages/event';
import EventDetail from '@/pages/event/detail';
import historyEvents from '@/pages/historyEvents';
import MonObjectManage from '@/pages/monObjectManage';
import Demo from '@/pages/demo';
import TaskTpl from '@/pages/taskTpl';
import TaskTplAdd from '@/pages/taskTpl/add';
import TaskTplDetail from '@/pages/taskTpl/detail';
import TaskTplModify from '@/pages/taskTpl/modify';
import TaskTplClone from '@/pages/taskTpl/clone';
import Task from '@/pages/task';
import TaskAdd from '@/pages/task/add';
import TaskResult from '@/pages/task/result';
import TaskDetail from '@/pages/task/detail';
import Version from '@/pages/help/version';
import Contact from '@/pages/help/contact';

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
  if (!profile.id && location.pathname != '/login') {
    dispatch({ type: 'common/getClusters' });
    if (!location.pathname.startsWith('/chart/') && !location.pathname.startsWith('/alert-cur-events/') && !location.pathname.startsWith('/alert-his-events/')) {
      dispatch({ type: 'account/getProfile' });
      dispatch({ type: 'common/getBusiGroups' });
    }
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
        <Route path='/metric/explorer' component={Explore} exact />
        <Route path='/object/explorer' component={ObjectExplore} exact />
        <Route path='/busi-groups' component={Business} />
        <Route path='/users' component={Users} />
        <Route path='/user-groups' component={Groups} />
        <Route path='/account/profile/:tab' component={Profile} />

        <Route path='/dashboard/:busiId/:id' component={DashboardDetail} />
        <Route path='/dashboards' component={Dashboard} />
        <Route path='/chart/:ids' component={Chart} />
        <Route path='/resource/:id?' component={ResourcePage} />
        <Route path='/indicator' component={IndicatorPage} />

        <Route exact path='/alert-rules/add/:group_id' component={StrategyAdd} />
        <Route exact path='/alert-rules/edit/:id' component={StrategyEdit} />
        <Route exact path='/alert-rules/:id?' component={Strategy} />
        <Route exact path='/alert-mutes' component={Shield} />
        <Route exact path='/alert-mutes/add/:from?' component={AddShield} />
        <Route exact path='/alert-mutes/edit/:id' component={ShieldEdit} />
        <Route exact path='/alert-subscribes' component={Subscribe} />
        <Route exact path='/alert-subscribes/add' component={SubscribeAdd} />
        <Route exact path='/alert-subscribes/edit/:id' component={SubscribeEdit} />

        <Route exact path='/alert-cur-events' component={Event} />
        <Route exact path='/alert-his-events' component={historyEvents} />
        <Route exact path='/alert-cur-events/:eventId' component={EventDetail} />
        <Route exact path='/alert-his-events/:eventId' component={EventDetail} />
        <Route exact path='/targets' component={MonObjectManage} />

        <Route exact path='/job-tpls' component={TaskTpl} />
        <Route exact path='/job-tpls/add' component={TaskTplAdd} />
        <Route exact path='/job-tpls/add/task' component={TaskAdd} />
        <Route exact path='/job-tpls/:id/detail' component={TaskTplDetail} />
        <Route exact path='/job-tpls/:id/modify' component={TaskTplModify} />
        <Route exact path='/job-tpls/:id/clone' component={TaskTplClone} />
        <Route exact path='/job-tasks' component={Task} />
        <Route exact path='/job-tasks/add' component={TaskAdd} />
        <Route exact path='/job-tasks/:id/result' component={TaskResult} />
        <Route exact path='/job-tasks/:id/detail' component={TaskDetail} />

        <Route exact path='/help/version' component={Version} />
        <Route exact path='/help/contact' component={Contact} />

        {lazyRoutes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        <Route path='/' exact>
          <Redirect to='/metric/explorer' />
        </Route>
        <Route path='/404' component={NotFound} />
        <Route path='*' component={NotFound} />
      </Switch>
    </div>
  );
}
