import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      css={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div css={{ width: '100%', maxWidth: '500px' }}>
        {/* Logo/Brand */}
        <div css={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 css={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 0.5rem 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}>
            DesignDeck
          </h1>
          <p css={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            margin: '0',
            fontWeight: '300',
          }}>
            Create stunning designs with ease
          </p>
        </div>

        {/* Auth Form */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Footer */}
        <div css={{ textAlign: 'center', marginTop: '2rem' }}>
          <p css={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.9rem',
            margin: '0',
          }}>
            © 2024 DesignDeck. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
