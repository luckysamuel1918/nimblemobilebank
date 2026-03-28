import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Camera, User, Phone, Mail, MapPin, Edit, MessageCircle, LogOut, Calendar, CreditCard, Globe, Landmark, Lock, Briefcase, Heart } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import ChatModal from '@/components/ChatModal';
import PasswordChangeModal from '@/components/PasswordChangeModal';

const Profile = () => {
  const { currentUser, userData, refreshUserData, logout } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [accountType, setAccountType] = useState('');
  const [occupation, setOccupation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setPhone(userData.phone || '');
      setAddress(userData.address || '');
      setDateOfBirth(userData.dateOfBirth || '');
      setCountry(userData.country || '');
      setAccountType(userData.accountType || '');
      setOccupation(userData.occupation || '');
      setMaritalStatus(userData.maritalStatus || '');
    }
  }, [userData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Save to localStorage for persistence across devices
        localStorage.setItem(`profilePicture_${currentUser.uid}`, base64String);
        
        // Update user document
        await updateDoc(doc(db, 'users', currentUser.uid), {
          profilePicture: base64String
        });

        await refreshUserData();
        
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth,
        country,
        accountType,
        occupation,
        maritalStatus
      });

      await refreshUserData();
      setEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const getProfilePicture = () => {
    // First check userData, then localStorage
    if (userData?.profilePicture) {
      return userData.profilePicture;
    }
    
    if (currentUser) {
      const stored = localStorage.getItem(`profilePicture_${currentUser.uid}`);
      return stored;
    }
    
    return null;
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="text-xs sm:text-sm"
          >
            <Edit className="h-4 w-4 mr-1 sm:mr-2" />
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Profile Picture Section */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="relative inline-block mb-4">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32">
                <AvatarImage src={getProfilePicture() || undefined} />
                <AvatarFallback className="text-2xl sm:text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors"
                disabled={loading}
              >
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {userData?.firstName} {userData?.lastName}
            </h2>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-sm">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter your country"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="occupation" className="text-sm">Occupation</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Enter your occupation"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="maritalStatus" className="text-sm">Marital Status</Label>
                  <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                    <SelectTrigger className="text-sm">
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

                <div>
                  <Label htmlFor="accountType" className="text-sm">Account Type</Label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full text-sm" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <span className="text-sm font-medium">{userData?.firstName} {userData?.lastName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <span className="text-sm font-medium break-all">{userData?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <span className="text-sm font-medium">{userData?.accountNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Landmark className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Account Type</p>
                      <span className="text-sm font-medium capitalize">
                        {userData?.accountType ? `${userData.accountType} Account` : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {userData?.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <span className="text-sm font-medium">
                        {new Date(userData.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                {userData?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <span className="text-sm font-medium">{userData.phone}</span>
                    </div>
                  </div>
                )}
                
                {userData?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <span className="text-sm font-medium">{userData.address}</span>
                    </div>
                  </div>
                )}

                {userData?.country && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Country</p>
                      <span className="text-sm font-medium">{userData.country}</span>
                    </div>
                  </div>
                )}

                {userData?.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Occupation</p>
                      <span className="text-sm font-medium">{userData.occupation}</span>
                    </div>
                  </div>
                )}

                {userData?.maritalStatus && (
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Marital Status</p>
                      <span className="text-sm font-medium capitalize">{userData.maritalStatus}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowPasswordModal(true)}>
            <CardContent className="p-4 text-center">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Change Password</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChat(true)}>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">Contact Customer Service</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={logout}>
            <CardContent className="p-4 text-center">
              <LogOut className="h-6 w-6 sm:h-8 sm:w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium text-destructive">Logout</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />

      {/* Modals */}
      <ChatModal 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
      
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Profile;
