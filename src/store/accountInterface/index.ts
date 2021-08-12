export interface accountStoreState {
  num?: number;
  profile: {
    nickname: string;
    role: string;
    roles: string[];
    username: string;
    email: string;
    phone: string;
    id: number;
    portrait: string;
    contacts: { string?: string };
  };
}

export type RootState = {
  account: accountStoreState;
};
