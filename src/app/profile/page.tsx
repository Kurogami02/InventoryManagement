'use client';

import React from 'react';

import ChangePassword from './components/change-password';
import UserInfo from './components/user-info';

const Profile: React.FC = () => {
  return (
    <>
      <UserInfo />
      <br />
      <ChangePassword />
    </>
  );
};

export default Profile;
