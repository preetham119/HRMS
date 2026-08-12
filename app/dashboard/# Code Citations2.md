# Code Citations

## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/rsdimatulac/SlackX/blob/edf4d94299ca0f32ba5198f95e61872e133504e2/react-app/src/store/session.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/clapage/bekind/blob/11400a96f477591866ef8a93677be4aeb3c056e6/client/src/components/Login.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/dejongyeong/abbey-sm-app/blob/bd6479bfa3432a8af71144e6ad4efc03f1d08d5d/src/services/auth/login.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/zavastopher/Christopher_Zavala/blob/93c9d95a49c821ba77332d08f949662ee0e0427f/fullstackprojects/Wolfwatch/client/components/AuthProvider.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/York-Solutions-B2E/jimmy-vo-shift-v2/blob/aca6b1d087595b6a9be8a8724fb2321f9cf61df2/frontend/src/store/features/userSlice.ts

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: unknown
https://github.com/fabiofernandes2002/CyberGuard/blob/626edfa68122eb20cd13585412f523804e87da54/Frontend/src/services/auth.service.js

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate.
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```


## License: MIT
https://github.com/EliasGcf/daily-diet/blob/360d65b9c67de358395fd8f677e0b42a04a6c45d/packages/mobile/src/hooks/useAuth.tsx

```
I'll debug and fix the issue. Let me check a few things:

1. **First, verify the auth provider is updated to handle the new user fields:**

````typescript
// filepath: c:\Users\DesIDEA\HRMS\components\providers\auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  employeeId: string;
  name?: string;
  department?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hrms-auth-session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }
      const parsed = JSON.parse(raw) as { token: string; user: UserProfile };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch (error) {
      console.error('Failed to parse auth session:', error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to authenticate. Please try again.');
      }

      const payload = await response.json();
      const nextUser = payload.user as UserProfile;
      const nextToken = payload.token as string;

      if (!nextUser || !nextToken) {
        throw new Error('Invalid response from server');
      }

      const session = { token: nextToken, user: nextUser };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setToken(nextToken);
      setUser(nextUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated: Boolean(token && user), isReady, login, logout }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
````

---

2. **Update the API
```

