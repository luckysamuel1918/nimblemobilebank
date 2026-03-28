
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: string;
  occupation: string;
  maritalStatus: string;
  dateOfBirth: string;
  gender: string;
  employerName: string;
  annualIncome: string;
  motherMaidenName: string;
  socialSecurityNumber: string;
  driverLicenseNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  accountPurpose: string;
  sourceOfFunds: string;
  expectedMonthlyDeposit: string;
  hasDebitCard: boolean;
  hasCheckingAccount: boolean;
  hasSavingsAccount: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

const UserProfile = ({ isOpen, onClose, userId, onSuccess }: UserProfileProps) => {
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    accountNumber: '',
    accountType: 'savings',
    balance: 0,
    status: 'active',
    occupation: '',
    maritalStatus: '',
    dateOfBirth: '',
    gender: '',
    employerName: '',
    annualIncome: '',
    motherMaidenName: '',
    socialSecurityNumber: '',
    driverLicenseNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    accountPurpose: '',
    sourceOfFunds: '',
    expectedMonthlyDeposit: '',
    hasDebitCard: false,
    hasCheckingAccount: false,
    hasSavingsAccount: true,
    notifications: {
      email: true,
      sms: false,
      push: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zipCode || '',
          country: userData.country || '',
          accountNumber: userData.accountNumber || '',
          accountType: userData.accountType || 'savings',
          balance: userData.balance || 0,
          status: userData.status || 'active',
          occupation: userData.occupation || '',
          maritalStatus: userData.maritalStatus || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          employerName: userData.employerName || '',
          annualIncome: userData.annualIncome || '',
          motherMaidenName: userData.motherMaidenName || '',
          socialSecurityNumber: userData.socialSecurityNumber || '',
          driverLicenseNumber: userData.driverLicenseNumber || '',
          emergencyContactName: userData.emergencyContactName || '',
          emergencyContactPhone: userData.emergencyContactPhone || '',
          emergencyContactRelationship: userData.emergencyContactRelationship || '',
          accountPurpose: userData.accountPurpose || '',
          sourceOfFunds: userData.sourceOfFunds || '',
          expectedMonthlyDeposit: userData.expectedMonthlyDeposit || '',
          hasDebitCard: userData.hasDebitCard || false,
          hasCheckingAccount: userData.hasCheckingAccount || false,
          hasSavingsAccount: userData.hasSavingsAccount || true,
          notifications: userData.notifications || {
            email: true,
            sms: false,
            push: false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive"
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        country: profile.country,
        accountType: profile.accountType,
        status: profile.status,
        occupation: profile.occupation,
        maritalStatus: profile.maritalStatus,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        employerName: profile.employerName,
        annualIncome: profile.annualIncome,
        motherMaidenName: profile.motherMaidenName,
        socialSecurityNumber: profile.socialSecurityNumber,
        driverLicenseNumber: profile.driverLicenseNumber,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        emergencyContactRelationship: profile.emergencyContactRelationship,
        accountPurpose: profile.accountPurpose,
        sourceOfFunds: profile.sourceOfFunds,
        expectedMonthlyDeposit: profile.expectedMonthlyDeposit,
        hasDebitCard: profile.hasDebitCard,
        hasCheckingAccount: profile.hasCheckingAccount,
        hasSavingsAccount: profile.hasSavingsAccount,
        notifications: profile.notifications
      });

      toast({
        title: "Profile Updated",
        description: "User profile has been successfully updated."
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update user profile.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile - Complete Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Read Only)</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={profile.zipCode}
                  onChange={(e) => setProfile(prev => ({ ...prev, zipCode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Employment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={profile.occupation}
                  onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="employerName">Employer Name</Label>
                <Input
                  id="employerName"
                  value={profile.employerName}
                  onChange={(e) => setProfile(prev => ({ ...prev, employerName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input
                  id="annualIncome"
                  value={profile.annualIncome}
                  onChange={(e) => setProfile(prev => ({ ...prev, annualIncome: e.target.value }))}
                  placeholder={`e.g., ${getCurrencySymbol({ country: profile.country })}50,000`}
                />
              </div>
              <div>
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={profile.maritalStatus}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, maritalStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Security Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="motherMaidenName">Mother's Maiden Name</Label>
                <Input
                  id="motherMaidenName"
                  value={profile.motherMaidenName}
                  onChange={(e) => setProfile(prev => ({ ...prev, motherMaidenName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="socialSecurityNumber">Social Security Number</Label>
                <Input
                  id="socialSecurityNumber"
                  value={profile.socialSecurityNumber}
                  onChange={(e) => setProfile(prev => ({ ...prev, socialSecurityNumber: e.target.value }))}
                  placeholder="XXX-XX-XXXX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="driverLicenseNumber">Driver's License Number</Label>
              <Input
                id="driverLicenseNumber"
                value={profile.driverLicenseNumber}
                onChange={(e) => setProfile(prev => ({ ...prev, driverLicenseNumber: e.target.value }))}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                <Input
                  id="emergencyContactRelationship"
                  value={profile.emergencyContactRelationship}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number (Read Only)</Label>
                <Input
                  id="accountNumber"
                  value={profile.accountNumber}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="balance">Balance (Read Only)</Label>
                <Input
                  id="balance"
                  value={formatCurrency(profile.balance, { country: profile.country })}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select
                  value={profile.accountType}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, accountType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="checking">Checking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountPurpose">Account Purpose</Label>
                <Textarea
                  id="accountPurpose"
                  value={profile.accountPurpose}
                  onChange={(e) => setProfile(prev => ({ ...prev, accountPurpose: e.target.value }))}
                  placeholder="Primary purpose for opening this account"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="sourceOfFunds">Source of Funds</Label>
                <Textarea
                  id="sourceOfFunds"
                  value={profile.sourceOfFunds}
                  onChange={(e) => setProfile(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
                  placeholder="Primary source of funds for this account"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expectedMonthlyDeposit">Expected Monthly Deposit</Label>
              <Input
                id="expectedMonthlyDeposit"
                value={profile.expectedMonthlyDeposit}
                onChange={(e) => setProfile(prev => ({ ...prev, expectedMonthlyDeposit: e.target.value }))}
                placeholder={`e.g., ${getCurrencySymbol({ country: profile.country })}2,000`}
              />
            </div>

            <div>
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={profile.status}
                onValueChange={(value) => setProfile(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Complete Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
