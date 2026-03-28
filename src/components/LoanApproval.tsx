
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface LoanApprovalProps {
  loans: any[];
  onLoanUpdate: () => void;
}

const LoanApproval = ({ loans, onLoanUpdate }: LoanApprovalProps) => {
  const { toast } = useToast();

  // Get user data for currency formatting
  const [userDataMap, setUserDataMap] = React.useState<{[key: string]: any}>({});

  React.useEffect(() => {
    const fetchUserData = async () => {
      const dataMap: {[key: string]: any} = {};
      for (const loan of loans) {
        if (loan.userId && !dataMap[loan.userId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', loan.userId));
            if (userDoc.exists()) {
              dataMap[loan.userId] = userDoc.data();
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      }
      setUserDataMap(dataMap);
    };
    fetchUserData();
  }, [loans]);

  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject', loanData: any) => {
    try {
      await updateDoc(doc(db, 'loanApplications', loanId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: serverTimestamp()
      });

      if (action === 'approve') {
        // Get user data and update balance
        const userDoc = await getDoc(doc(db, 'users', loanData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newBalance = (userData.balance || 0) + loanData.amount;

          await updateDoc(doc(db, 'users', loanData.userId), {
            balance: newBalance
          });

          // Create transaction record
          await addDoc(collection(db, 'transactions'), {
            userId: loanData.userId,
            type: 'Loan Disbursement',
            amount: loanData.amount,
            status: 'completed',
            reference: 'LOAN' + Date.now().toString(),
            timestamp: serverTimestamp()
          });
        }
      }

      toast({
        title: `Loan ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The loan application has been ${action === 'approve' ? 'approved and funds disbursed' : 'rejected'}.`
      });

      onLoanUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing the loan application.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{loan.applicantName}</h3>
                  <p className="text-sm text-gray-600">{loan.email}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><strong>Loan Type:</strong> {loan.loanType}</p>
                    <p className="text-sm"><strong>Amount:</strong> {formatCurrency(loan.amount || 0, userDataMap[loan.userId])}</p>
                    <p className="text-sm"><strong>Purpose:</strong> {loan.purpose}</p>
                    <p className="text-sm"><strong>Monthly Income:</strong> {formatCurrency(loan.monthlyIncome || 0, userDataMap[loan.userId])}</p>
                    <p className="text-sm"><strong>Employment:</strong> {loan.employment}</p>
                    <p className="text-sm"><strong>Duration:</strong> {loan.duration} months</p>
                    {loan.collateral && (
                      <p className="text-sm"><strong>Collateral:</strong> {loan.collateral}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    loan.status === 'approved' ? 'default' : 
                    loan.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {loan.status}
                  </Badge>
                  
                  {loan.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleLoanAction(loan.id, 'approve', loan)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleLoanAction(loan.id, 'reject', loan)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loans.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No loan applications found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanApproval;
