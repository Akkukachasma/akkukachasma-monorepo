"use client";

import UserProfileForm from "@/components/account/UserProfileForm";
import UpdatePasswordForm from "@/components/account/UpdatePasswordForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AccountPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-gray-600">
          Update your profile details and security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
