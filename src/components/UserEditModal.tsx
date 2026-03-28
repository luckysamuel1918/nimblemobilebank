import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated: () => void;
}

const UserEditModal = ({ isOpen, onClose, userId, onUserUpdated }: UserEditModalProps) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    accountNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    balance: 0
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          email: data.email || '',
          accountNumber: data.accountNumber || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          balance: data.balance || 0
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user data
      await updateDoc(doc(db, 'users', userId), {
        email: userData.email,
        accountNumber: userData.accountNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        balance: Number(userData.balance),
        updatedAt: new Date()
      });

      toast({
        title: 'Success',
        description: 'User information updated successfully!',
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fintech-card w-[95%] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit User Information
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="no-zoom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              value={userData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              required
              className="no-zoom"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={userData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className="no-zoom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={userData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className="no-zoom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={userData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="no-zoom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Account Balance ($)</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={userData.balance}
              onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
              required
              className="no-zoom"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full fintech-gradient"
          >
            {loading ? 'Updating...' : 'Update User Information'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserEditModal;