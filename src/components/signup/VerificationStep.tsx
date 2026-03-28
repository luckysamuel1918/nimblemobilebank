
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface VerificationStepProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  formData,
  setFormData,
  onSubmit,
  onBack,
  loading
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Identity Verification</CardTitle>
        <p className="text-muted-foreground">Step 3 of 3</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Please provide one of the following identification numbers for verification purposes.
          </p>
          
          <div>
            <Label htmlFor="ssnOrTin">SSN or TIN Number</Label>
            <Input
              id="ssnOrTin"
              name="ssnOrTin"
              value={formData.ssnOrTin}
              onChange={handleInputChange}
              placeholder="Enter your SSN or TIN number"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="productKey">Product Key</Label>
            <Input
              id="productKey"
              name="productKey"
              value={formData.productKey}
              onChange={handleInputChange}
              required
              placeholder="Enter product key"
              disabled={loading}
            />
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <p className="font-medium mb-1">Privacy Notice:</p>
            <p>Your identification information is encrypted and stored securely. We use this information solely for account verification and compliance purposes.</p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerificationStep;
