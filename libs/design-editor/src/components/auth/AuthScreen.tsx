import React, { useState } from 'react';
import { css } from '@emotion/react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

const containerStyles = css`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const logoStyles = css`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 3rem;
    font-weight: bold;
    color: white;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0.5rem 0 0 0;
  }
`;

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = (user: any) => {
    onAuthSuccess(user);
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div css={containerStyles}>
      <div>
        <div css={logoStyles}>
          <h1>DesignDeck</h1>
          <p>Create amazing designs with ease</p>
        </div>
        
        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};
