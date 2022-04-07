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
import miniDva from './miniDva';
import CommonStore from '@/module/common'
import ResourceStore from '@/module/resource';
import ProfileStore from '@/module/account';
import WarningStore from '@/module/warning';
import ShieldStore from '@/module/shield';
import EventStore from '@/module/event';
import { dynamicPackages } from '@/utils';

const Packages = dynamicPackages();
for (let pkg of Packages) {
  if (pkg.module) {
    miniDva.addModel(pkg.module);
  }
}

miniDva.addModel(CommonStore);
miniDva.addModel(ResourceStore);
miniDva.addModel(ProfileStore);
miniDva.addModel(WarningStore);
miniDva.addModel(ShieldStore);
miniDva.addModel(EventStore);
miniDva.start();

export default miniDva.store;
