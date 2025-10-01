export * from './hooks';
export * from './editor';
export * from './settings';
export * from './layers';
export * from './types';
export { default as Timeline } from './editor/timeline/Timeline';
// export { AnimationSettings } from './editor/timeline/types';
export { AnimationService } from './editor/animation';

// Auth components
export { AuthScreen } from './components/auth/AuthScreen';
export { LoginForm } from './components/auth/LoginForm';
export { RegisterForm } from './components/auth/RegisterForm';

// Services
export { authService } from './services/authService';
export { projectService } from './services/projectService';
export type { User, AuthResponse, LoginCredentials, RegisterCredentials } from './services/authService';
export type { Project, ProjectListResponse, SaveCanvasRequest } from './services/projectService';

// Save component
export { SaveButton } from './components/SaveButton';