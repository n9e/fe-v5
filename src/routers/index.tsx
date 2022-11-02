/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import { Switch, Route, useLocation, Redirect } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import querystring from 'query-string';
import { RootState, accountStoreState } from '@/store/accountInterface';
import NotFound from '@/pages/NotFound';
import Page403 from '@/pages/NotFound/Page403';
import Login from '@/pages/login';
import Overview from '@/pages/login/overview';
import LoginCallback from '@/pages/loginCallback';
import LoginCallbackCAS from '@/pages/loginCallback/cas';
import LoginCallbackOAuth from '@/pages/loginCallback/oauth';
import Strategy from '@/pages/warning/strategy';
import Profile from '@/pages/account/profile';
import Dashboard from '@/pages/dashboard/List';
import Chart from '@/pages/chart';
import DashboardDetail from '@/pages/dashboard/Detail/index';
import DashboardShare from '@/pages/dashboard/Share/index';
import Groups from '@/pages/user/groups';
import Users from '@/pages/user/users';
import Business from '@/pages/user/business';
import Explore from '@/pages/metric/explorer';
import ObjectExplore from '@/pages/monitor/object';
import IndicatorPage from '@/pages/monitor/indicator';
import StrategyAdd from '@/pages/warning/strategy/add';
import StrategyEdit from '@/pages/warning/strategy/edit';
import StrategyBrain from '@/pages/warning/strategy/Jobs';
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
import Migrate from '@/pages/help/migrate';
import Servers from '@/pages/help/servers';
import Datasource from '@/pages/datasource';
import DatasourceAdd from '@/pages/datasource/Form';
import RecordingRule from '@/pages/recordingRules';
import RecordingRuleAdd from '@/pages/recordingRules/add';
import RecordingRuleEdit from '@/pages/recordingRules/edit';
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
  if (!profile.id && location.pathname != '/login' && !location.pathname.startsWith('/callback')) {
    dispatch({ type: 'common/getClusters' });
    if (
      !location.pathname.startsWith('/chart/') &&
      !location.pathname.startsWith('/dashboards/share/') &&
      !location.pathname.startsWith('/alert-cur-events/') &&
      !location.pathname.startsWith('/alert-his-events/') &&
      !location.pathname.startsWith('/callback')
    ) {
      dispatch({ type: 'account/getProfile' });
      dispatch({ type: 'common/getBusiGroups' });
    }
  }

  // 大盘在全屏和暗黑主题下需要定义个 dark 样式名
  let themeClassName = '';
  if (location.pathname.indexOf('/dashboard') === 0) {
    const query = querystring.parse(location.search);
    if (query?.viewMode === 'fullscreen' && query?.themeMode === 'dark') {
      themeClassName = 'theme-dark';
    }
  }

  return (
    <div className={`content ${themeClassName}`}>
      <Switch>
        <Route path='/demo' component={Demo} />
        <Route path='/overview' component={Overview} />
        <Route path='/login' component={Login} exact />
        <Route path='/callback' component={LoginCallback} exact />
        <Route path='/callback/cas' component={LoginCallbackCAS} exact />
        <Route path='/callback/oauth' component={LoginCallbackOAuth} exact />
        <Route path='/metric/explorer' component={Explore} exact />
        <Route path='/object/explorer' component={ObjectExplore} exact />
        <Route path='/busi-groups' component={Business} />
        <Route path='/users' component={Users} />
        <Route path='/user-groups' component={Groups} />
        <Route path='/account/profile/:tab' component={Profile} />

        <Route path='/dashboard/:id' exact component={DashboardDetail} />
        <Route path='/dashboards/:id' exact component={DashboardDetail} />
        <Route path='/dashboards/share/:id' component={DashboardShare} />
        <Route path='/dashboards' component={Dashboard} />
        <Route path='/chart/:ids' component={Chart} />
        <Route path='/indicator' component={IndicatorPage} />

        <Route exact path='/alert-rules/add/:group_id' component={StrategyAdd} />
        <Route exact path='/alert-rules/edit/:id' component={StrategyEdit} />
        <Route exact path='/alert-rules/:id?' component={Strategy} />
        <Route exact path='/alert-rules/brain/:id' component={StrategyBrain} />
        <Route exact path='/alert-mutes' component={Shield} />
        <Route exact path='/alert-mutes/add/:from?' component={AddShield} />
        <Route exact path='/alert-mutes/edit/:id' component={ShieldEdit} />
        <Route exact path='/alert-subscribes' component={Subscribe} />
        <Route exact path='/alert-subscribes/add' component={SubscribeAdd} />
        <Route exact path='/alert-subscribes/edit/:id' component={SubscribeEdit} />

        <Route exact path='/recording-rules/:id?' component={RecordingRule} />
        <Route exact path='/recording-rules/add/:group_id' component={RecordingRuleAdd} />
        <Route exact path='/recording-rules/edit/:id' component={RecordingRuleEdit} />

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
        <Route exact path='/help/migrate' component={Migrate} />
        <Route exact path='/help/servers' component={Servers} />
        <Route exact path='/help/source' component={Datasource} />
        <Route exact path='/help/source/:action/:cate/:type' component={DatasourceAdd} />
        <Route exact path='/help/source/:action/:cate/:type/:id' component={DatasourceAdd} />

        {lazyRoutes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        <Route path='/' exact>
          <Redirect to='/metric/explorer' />
        </Route>
        <Route path='/403' component={Page403} />
        <Route path='/404' component={NotFound} />
        <Route path='*' component={NotFound} />
      </Switch>
    </div>
  );
}
