import miniDva from './miniDva';
import CommonStore from '@/module/common'
import ResourceStore from '@/module/resource';
import ProfileStore from '@/module/account';
import WarningStore from '@/module/warning';
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
miniDva.addModel(EventStore);
miniDva.start();

export default miniDva.store;
