
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoanModal = ({ isOpen, onClose }: LoanModalProps) => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    loanType: '',
    amount: '',
    purpose: '',
    term: '',
    monthlyIncome: '',
    employmentStatus: ''
  });

  const loanTypes = [
    'Personal Loan',
    'Home Loan',
    'Auto Loan',
    'Business Loan',
    'Student Loan'
  ];

  const employmentStatuses = [
    'Full-time Employee',
    'Part-time Employee',
    'Self-employed',
    'Unemployed',
    'Student',
    'Retired'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) return;

    setLoading(true);

    try {
      // Generate application reference
      const reference = `LOAN${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create loan application record
      await addDoc(collection(db, 'loanApplications'), {
        userId: currentUser.uid,
        applicantName: `${userData.firstName} ${userData.lastName}`,
        accountNumber: userData.accountNumber,
        loanType: formData.loanType,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        term: parseInt(formData.term),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        employmentStatus: formData.employmentStatus,
        reference,
        status: 'pending',
        submittedAt: Timestamp.now()
      });

      toast({
        title: "Loan Application Submitted",
        description: `Your ${formData.loanType} application has been submitted. Reference: ${reference}`
      });

      onClose();
      setFormData({
        loanType: '',
        amount: '',
        purpose: '',
        term: '',
        monthlyIncome: '',
        employmentStatus: ''
      });
    } catch (error) {
      console.error('Loan application error:', error);
      toast({
        title: "Application Failed",
        description: "There was an error submitting your loan application.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Apply for Loan
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="loanType">Loan Type</Label>
            <Select value={formData.loanType} onValueChange={(value) => setFormData({...formData, loanType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                {loanTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Loan Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="1000"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="e.g., 50000"
              required
            />
          </div>

          <div>
            <Label htmlFor="term">Loan Term (months)</Label>
            <Input
              id="term"
              type="number"
              value={formData.term}
              onChange={(e) => setFormData({...formData, term: e.target.value})}
              placeholder="e.g., 60"
              required
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder="What will you use this loan for?"
              required
            />
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              step="100"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="employmentStatus">Employment Status</Label>
            <Select value={formData.employmentStatus} onValueChange={(value) => setFormData({...formData, employmentStatus: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                {employmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Apply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanModal;
