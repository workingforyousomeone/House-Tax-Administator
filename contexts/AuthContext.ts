
import React from 'react';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  changePassword: (newPass: string) => boolean;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  changePassword: () => false,
});
