import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'The passwords you entered do not match. Please try again.',
      });
      return;
    }

    if (password.length < 6) {
      showToast({
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    setIsLoading(true);

    await register(name, email, password);
    
    setIsLoading(false);
  };

  return (
    <div
      css={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div css={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 css={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1a1a1a',
          margin: '0 0 0.5rem 0'
        }}>
          Create Account
        </h2>
        <p css={{ 
          color: '#666', 
          margin: '0',
          fontSize: '1rem'
        }}>
          Join DesignDeck and start creating amazing designs
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div css={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="name" 
            css={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#333'
            }}
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            css={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s',
              '&:focus': {
                outline: 'none',
                borderColor: '#007bff',
              },
            }}
            placeholder="Enter your full name"
          />
        </div>

        <div css={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="email" 
            css={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#333'
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            css={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s',
              '&:focus': {
                outline: 'none',
                borderColor: '#007bff',
              },
            }}
            placeholder="Enter your email"
          />
        </div>

        <div css={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="password" 
            css={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#333'
            }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            css={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s',
              '&:focus': {
                outline: 'none',
                borderColor: '#007bff',
              },
            }}
            placeholder="Create a password"
          />
        </div>

        <div css={{ marginBottom: '1.5rem' }}>
          <label 
            htmlFor="confirmPassword" 
            css={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#333'
            }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            css={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s',
              '&:focus': {
                outline: 'none',
                borderColor: '#007bff',
              },
            }}
            placeholder="Confirm your password"
          />
        </div>


        <button
          type="submit"
          disabled={isLoading}
          css={{
            width: '100%',
            padding: '0.75rem',
            background: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              background: isLoading ? '#ccc' : '#218838',
            },
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div css={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <p css={{ color: '#666', margin: '0' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            css={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '1rem',
              '&:hover': {
                color: '#0056b3',
              },
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
