// src/components/UserProfile.js

import React from 'react';
import { useUserAttributes } from '../hooks/useUserAttributes';

const UserProfile = () => {
  const userAttributes = useUserAttributes();

  if (!userAttributes) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Email: {userAttributes.email}</p>
      <p>Username: {userAttributes.username}</p>
      <p>Phone: {userAttributes.phone_number}</p>
      <p>sub: {userAttributes.sub}</p>
    </div>
  );
};

export default UserProfile;
