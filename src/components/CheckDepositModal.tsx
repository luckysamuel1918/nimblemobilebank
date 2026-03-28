
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';

interface CheckDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckDepositModal = ({ isOpen, onClose }: CheckDepositModalProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(reader.result as string);
      } else {
        setBackImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !amount || !frontImage || !backImage) return;

    setLoading(true);

    try {
      const depositAmount = parseFloat(amount);
      if (depositAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'Check Deposit',
        amount: depositAmount,
        status: 'pending',
        description: description || 'Check deposit',
        reference: 'CHK' + Date.now().toString(),
        timestamp: serverTimestamp(),
        checkImages: {
          front: frontImage,
          back: backImage
        }
      });

      toast({
        title: "Check Deposit Submitted",
        description: "Your check deposit is being processed. It may take 1-3 business days to complete.",
      });

      onClose();
      setAmount('');
      setDescription('');
      setFrontImage(null);
      setBackImage(null);
    } catch (error) {
      console.error('Error submitting check deposit:', error);
      toast({
        title: "Deposit Failed",
        description: "An error occurred while submitting your check deposit.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deposit Check</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Check Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note about this deposit"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Front of Check</Label>
              <div className="mt-2">
                {frontImage ? (
                  <div className="relative">
                    <img 
                      src={frontImage} 
                      alt="Front of check" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={() => document.getElementById('front-upload')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => document.getElementById('front-upload')?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload Front</p>
                    </div>
                  </Button>
                )}
                <input
                  id="front-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'front')}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label>Back of Check</Label>
              <div className="mt-2">
                {backImage ? (
                  <div className="relative">
                    <img 
                      src={backImage} 
                      alt="Back of check" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={() => document.getElementById('back-upload')?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => document.getElementById('back-upload')?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload Back</p>
                    </div>
                  </Button>
                )}
                <input
                  id="back-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'back')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !amount || !frontImage || !backImage} 
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Submit Deposit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckDepositModal;
