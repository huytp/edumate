import { useCallback, useEffect, useState } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ParentApp from './ParentApp.tsx';
import { AuthScreen } from './components/auth/AuthScreen.tsx';
import './index.css';
import { Account, authApi, setUnauthorizedHandler } from './utils/api';
import { storageService } from './utils/storage';

type BootState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'error' }
  | { status: 'ready'; account: Account };

const Message = ({ text, onRetry }: { text: string; onRetry?: () => void }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-600 p-6 text-center">
    <p className="font-semibold">{text}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold">
        Thử lại
      </button>
    )}
  </div>
);

// Nobody gets in without an account: guests see the login / register screen.
function Root() {
  const [state, setState] = useState<BootState>({ status: 'loading' });

  // Teachers work on their classroom data, which must be loaded before the app renders.
  const enter = useCallback(async (account: Account) => {
    setState({ status: 'loading' });
    try {
      if (account.role === 'teacher') await storageService.init();
      setState({ status: 'ready', account });
    } catch (error) {
      console.error(error);
      setState(authApi.hasToken() ? { status: 'error' } : { status: 'guest' });
    }
  }, []);

  const boot = useCallback(async () => {
    if (!authApi.hasToken()) return setState({ status: 'guest' });
    setState({ status: 'loading' });
    try {
      await enter(await authApi.me());
    } catch (error) {
      console.error(error);
      setState(authApi.hasToken() ? { status: 'error' } : { status: 'guest' });
    }
  }, [enter]);

  const logout = useCallback(async () => {
    await storageService.flush().catch(() => {});
    await authApi.logout().catch(() => {});
    storageService.clear();
    setState({ status: 'guest' });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      storageService.clear();
      setState({ status: 'guest' });
    });
    boot();
  }, [boot]);

  switch (state.status) {
    case 'loading':
      return <Message text="Đang tải dữ liệu..." />;
    case 'error':
      return <Message text="Không kết nối được máy chủ dữ liệu. Vui lòng kiểm tra backend đã chạy chưa." onRetry={boot} />;
    case 'guest':
      return <AuthScreen onAuthenticated={enter} />;
    case 'ready':
      return state.account.role === 'teacher' ? (
        <App account={state.account} onSignOut={logout} />
      ) : (
        <ParentApp account={state.account} onLogout={logout} />
      );
  }
}

createRoot(document.getElementById('root')!).render(<Root />);
