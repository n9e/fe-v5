export const mapEnv = (
  MAP: { [propName: string]: string | number },
  env: string | undefined,
) => {
  switch (env) {
    case 'dev':
      return MAP.DEV;
    case 'development':
      return MAP.TEST;
    case 'production':
      return MAP.PRODUCTION;
    default:
      return MAP.TEST || MAP.DEV;
  }
};

const NODE_ENV = process.env.NODE_ENV;

const N9EAPIS = {
  DEV: 'http://10.86.76.13:8085',
  TEST: 'http://localhost:8765',
  PRODUCTION: '',
};
const N9EAPI = mapEnv(N9EAPIS, NODE_ENV);

export { N9EAPI };
