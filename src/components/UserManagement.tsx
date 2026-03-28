
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Ban, CheckCircle, PlusCircle, Settings, User, Eye, Edit } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import UserProfile from './UserProfile';
import { formatCurrency } from '@/utils/currency';

interface UserManagementProps {
  users: any[];
  onUserAction: (userId: string, action: 'suspend' | 'activate') => void;
  onChat: (userId: string) => void;
  onDeposit: (userId: string) => void;
  onEdit: (userId: string) => void;
}

const UserManagement = ({ users, onUserAction, onChat, onDeposit, onEdit }: UserManagementProps) => {
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

  const handleAccountTypeChange = async (userId: string, newAccountType: string) => {
    setUpdatingUser(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        accountType: newAccountType
      });
      
      toast({
        title: "Account type updated",
        description: `Account type changed to ${newAccountType}`,
      });
      
      // Don't refresh the page, let the parent component handle the update
    } catch (error) {
      console.error('Error updating account type:', error);
      toast({
        title: "Update failed",
        description: "Failed to update account type. Please try again.",
        variant: "destructive",
      });
    }
    setUpdatingUser(null);
  };

  const openProfile = (userId: string) => {
    setSelectedProfileUser(userId);
    setShowProfile(true);
  };

  const handleProfileSuccess = () => {
    // Callback for successful profile updates - just close the profile modal
    setShowProfile(false);
    setSelectedProfileUser('');
    // Don't refresh the page, just let the parent component handle updates
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Bank User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-col space-y-1">
                    <div>
                      <p className="text-sm sm:text-base font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Account: {user.accountNumber}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Balance: {formatCurrency(user.balance || 0, user)}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Phone: {user.phoneNumber || 'Not provided'}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Address: {
                          user.address 
                            ? typeof user.address === 'string' 
                              ? user.address 
                              : `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}, ${user.address.country || ''}`.replace(/^,\s*|,\s*,/g, '').replace(/,\s*$/, '') || 'Not provided'
                            : 'Not provided'
                        }
                      </p>
                      
                      {/* Account Type Selector */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Account Type:</span>
                        <Select
                          value={user.accountType || 'savings'}
                          onValueChange={(value) => handleAccountTypeChange(user.id, value)}
                          disabled={updatingUser === user.id}
                        >
                          <SelectTrigger className="w-auto h-7 text-xs">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="checking">Checking</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingUser === user.id && (
                          <Settings className="h-3 w-3 animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                    {user.status}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openProfile(user.id)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(user.id)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onChat(user.id)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeposit(user.id)}
                    className="text-xs px-2 py-1 h-7"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Deposit
                  </Button>
                  
                  {user.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUserAction(user.id, 'suspend')}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onUserAction(user.id, 'activate')}
                      className="text-xs px-2 py-1 h-7"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bank users found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        userId={selectedProfileUser}
        onSuccess={handleProfileSuccess}
      />
    </>
  );
};

export default UserManagement;
