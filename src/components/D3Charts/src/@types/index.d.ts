declare module "lodash";

declare module 'd3';

declare module "worker-loader?*" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}
