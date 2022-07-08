import React, { useState, useEffect } from 'react';
import { createGlobalState } from 'react-use';
import { useParams, useLocation, useHistory } from 'react-router-dom';
// import { createGlobalState } from '../../../react-use/src/factory/createGlobalState';

export const useTheme = createGlobalState<string>('flashcat');

export function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}
