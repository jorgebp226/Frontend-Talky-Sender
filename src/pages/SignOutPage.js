// src/pages/SignOutPage.js
import React from 'react';
import { useAuthenticator, Button } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

const SignOutPage = () => {
  const { signOut } = useAuthenticator((context) => [context.signOut]);
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>¿Estás seguro de que deseas cerrar sesión?</h1>
      <Button onClick={handleSignOut}>Cerrar sesión</Button>
    </div>
  );
};

export default SignOutPage;
