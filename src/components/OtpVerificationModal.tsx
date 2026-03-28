import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { X, Mail, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import emailjs from "@emailjs/browser";

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const OtpVerificationModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = "OTP Verification",
}: OtpVerificationModalProps) => {
  const { currentUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // countdown starts only when OTP is sent
  const [canResend, setCanResend] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Load user profile data
  useEffect(() => {
    if (isOpen && currentUser) {
      const loadUserData = async () => {
        try {
          const userDoc = await getDocs(
            query(collection(db, "users"), where("email", "==", currentUser.email))
          );
          if (!userDoc.empty) {
            setUserData(userDoc.docs[0].data());
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };
      loadUserData();
    }
  }, [isOpen, currentUser]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isOpen) {
      setCanResend(true);
    }
  }, [timeLeft, isOpen]);

  // Generate + send OTP
  const generateAndSendOtp = async () => {
    if (!currentUser) return;

    setSending(true);
    try {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000)
      ); // 5 minutes

      // ✅ store OTP under one doc per user
      await setDoc(
        doc(db, "otps", currentUser.uid),
        {
          userId: currentUser.uid,
          otp: generatedOtp,
          email: currentUser.email,
          createdAt: Timestamp.now(),
          expiresAt,
          verified: false,
        },
        { merge: true }
      );

      // send email
      await emailjs.send(
        "service_ddqz3a6",
        "template_zsv0alp",
        {
          to_email: currentUser.email,
          from_email: "support@westcoasttrusts.com",
          otp_code: generatedOtp,
          user_name:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
        },
        "VYfq3eW-NMpJkm35M"
      );

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${currentUser.email}`,
      });

      setTimeLeft(300); // ✅ start countdown here only
      setCanResend(false);
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!currentUser || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const otpRef = doc(db, "otps", currentUser.uid);
      const otpSnap = await getDoc(otpRef);

      if (!otpSnap.exists()) {
        toast({
          title: "Invalid OTP",
          description: "No OTP found. Please request a new one.",
          variant: "destructive",
        });
        return;
      }

      const otpData = otpSnap.data();

      if (otpData.otp !== otp) {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }

      if (Date.now() > otpData.expiresAt.toMillis()) {
        toast({
          title: "OTP Expired",
          description: "The OTP has expired. Please request a new one.",
          variant: "destructive",
        });
        return;
      }

      await updateDoc(otpRef, {
        verified: true,
        verifiedAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "OTP verified successfully!",
      });

      onSuccess();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
  Hello, {userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : currentUser?.displayName || currentUser?.email?.split("@")[0] || "User"}! 
  We've sent a 6-digit verification code to your {currentUser?.email}.
</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Enter verification code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Code expires in {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={generateAndSendOtp}
                disabled={sending || !canResend}
                className="text-sm"
              >
                {sending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : canResend ? (
                  "Resend OTP"
                ) : (
                  `Resend in ${formatTime(timeLeft)}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpVerificationModal;
