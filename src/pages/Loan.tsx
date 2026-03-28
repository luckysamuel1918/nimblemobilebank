
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';

interface LoanApplication {
  id: string;
  loanType: string;
  amount: number;
  purpose: string;
  employmentStatus: string;
  monthlyIncome: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: Date;
}

const Loan = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  
  // Form state
  const [loanType, setLoanType] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const loanTypes = [
    { id: 'personal', name: 'Personal Loan', maxAmount: 50000 },
    { id: 'auto', name: 'Auto Loan', maxAmount: 100000 },
    { id: 'home', name: 'Home Loan', maxAmount: 500000 },
    { id: 'business', name: 'Business Loan', maxAmount: 200000 },
    { id: 'education', name: 'Education Loan', maxAmount: 80000 },
  ];

  useEffect(() => {
    if (currentUser) {
      loadLoanApplications();
    }
  }, [currentUser]);

  const loadLoanApplications = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'loanApplications'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        appliedDate: doc.data().appliedDate?.toDate() || new Date()
      })) as LoanApplication[];
      
      setLoanApplications(applications);
    } catch (error) {
      console.error('Error loading loan applications:', error);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !userData) return;

    setLoading(true);
    
    try {
      await addDoc(collection(db, 'loanApplications'), {
        userId: currentUser.uid,
        userEmail: userData.email,
        userName: `${userData.firstName} ${userData.lastName}`,
        loanType,
        amount: parseFloat(amount),
        purpose,
        employmentStatus,
        monthlyIncome: parseFloat(monthlyIncome),
        status: 'pending',
        appliedDate: new Date()
      });

      toast({
        title: "Application Submitted",
        description: "Your loan application has been submitted successfully. We'll review it within 2-3 business days.",
      });

      // Reset form
      setLoanType('');
      setAmount('');
      setPurpose('');
      setEmploymentStatus('');
      setMonthlyIncome('');
      setShowApplication(false);
      
      await loadLoanApplications();
    } catch (error) {
      console.error('Error submitting loan application:', error);
      toast({
        title: "Error",
        description: "Failed to submit loan application. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          {!showApplication && (
            <Button onClick={() => setShowApplication(true)}>
              Apply for Loan
            </Button>
          )}
        </div>

        {showApplication ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Loan Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={loanType} onValueChange={setLoanType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter loan amount"
                    required
                  />
                  {loanType && (
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum: ${loanTypes.find(t => t.id === loanType)?.maxAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="purpose">Purpose of Loan</Label>
                  <Textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Describe the purpose of this loan"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="employment">Employment Status</Label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="income">Monthly Income ($)</Label>
                  <Input
                    id="income"
                    type="number"
                    step="100"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowApplication(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {loanApplications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan Applications</h3>
                  <p className="text-gray-500 mb-4">You haven't applied for any loans yet.</p>
                  <Button onClick={() => setShowApplication(true)}>
                    Apply for Your First Loan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              loanApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">
                          {loanTypes.find(t => t.id === application.loanType)?.name}
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          ${application.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Purpose: {application.purpose}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied: {application.appliedDate.toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Loan;
