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
