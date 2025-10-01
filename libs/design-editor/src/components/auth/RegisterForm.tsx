import React, { useState } from 'react';
import { css } from '@emotion/react';
import { authService, RegisterCredentials } from '../../services/authService';

interface RegisterFormProps {
  onSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

const formStyles = css`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const titleStyles = css`
  font-size: 2rem;
  font-weight: bold;
  color: #1a202c;
  text-align: center;
  margin-bottom: 2rem;
`;

const inputGroupStyles = css`
  margin-bottom: 1.5rem;
`;

const labelStyles = css`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const inputStyles = css`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const buttonStyles = css`
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #5a67d8;
  }
  
  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const switchStyles = css`
  text-align: center;
  margin-top: 1.5rem;
  color: #4a5568;
  
  button {
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    text-decoration: underline;
    
    &:hover {
      color: #5a67d8;
    }
  }
`;

const errorStyles = css`
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);
      onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div css={formStyles}>
      <h2 css={titleStyles}>Create Account</h2>
      
      {error && <div css={errorStyles}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div css={inputGroupStyles}>
          <label css={labelStyles} htmlFor="name">Full Name</label>
          <input
            css={inputStyles}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div css={inputGroupStyles}>
          <label css={labelStyles} htmlFor="email">Email</label>
          <input
            css={inputStyles}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div css={inputGroupStyles}>
          <label css={labelStyles} htmlFor="password">Password</label>
          <input
            css={inputStyles}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        
        <button css={buttonStyles} type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div css={switchStyles}>
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </div>
    </div>
  );
};
