import { createGlobalState } from 'react-hooks-global-state';

export const { useGlobalState } = createGlobalState<{
  dashboardMeta: {
    dashboardId: string;
    variableConfigWithOptions: any;
  };
  statFields: string[];
  tableFields: string[];
}>({
  statFields: [],
  tableFields: [],
  dashboardMeta: {} as {
    dashboardId: string;
    variableConfigWithOptions: any;
  },
});
