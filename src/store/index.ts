import miniDva from './miniDva';
import ResourceStore from '@/module/resource';
import ProfileStore from '@/module/account';
import WarningStore from '@/module/warning';
import EventStore from '@/module/event';

miniDva.addModel(ResourceStore);
miniDva.addModel(ProfileStore);
miniDva.addModel(WarningStore);
miniDva.addModel(EventStore);
miniDva.start();

export default miniDva.store;
