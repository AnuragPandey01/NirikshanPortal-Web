import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/authStore";

const LoginPage = () => {
  const [otpId, setOtpId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
  });

  const { sendOTP, loginWithOTP, loginWithGoogle } = useAuthStore();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await sendOTP(formData.name,formData.email);
      console.log(res);
      setOtpId(res.data.otpId);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(otpId, formData.otp);
      await loginWithOTP(otpId, formData.otp);
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Error with Google login:", error);
    }
  };

  const backToEmail = () => {
    setOtpId(null);
    setFormData({
      name: "",
      email: "",
      otp: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="max-w-sm w-full flex flex-col items-center border rounded-lg px-6 py-8 shadow-sm/5 bg-card">
        <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">
          Log in to Nirikshan Portal
        </p>

        <Button className="mt-8 w-full gap-3" onClick={handleGoogleLogin}>
          <GoogleLogo />
          Continue with Google
        </Button>

        <div className="my-7 w-full flex items-center justify-center overflow-hidden">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-sm px-2">OR</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {otpId === null ? (
          <form className="w-full space-y-4" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                className="w-full"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" className="mt-4 w-full">
              Send OTP
            </Button>
          </form>
        ) : (
          <form className="w-full space-y-4" onSubmit={handleOTPSubmit}>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full"
                value={formData.otp}
                onChange={handleInputChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                We sent a verification code to {formData.email}
              </p>
            </div>
            <Button type="submit" className="mt-4 w-full">
              Verify Code
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={backToEmail}
            >
              Back to email
            </Button>
          </form>
        )}

        <div className="mt-5">
          <p className="text-sm text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleLogo = () => (
  <svg
    width="1.2em"
    height="1.2em"
    id="icon-google"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block shrink-0 align-sub text-inherit size-lg"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M15.6823 8.18368C15.6823 7.63986 15.6382 7.0931 15.5442 6.55811H7.99829V9.63876H12.3194C12.1401 10.6323 11.564 11.5113 10.7203 12.0698V14.0687H13.2983C14.8122 12.6753 15.6823 10.6176 15.6823 8.18368Z"
        fill="#4285F4"
      ></path>
      <path
        d="M7.99812 16C10.1558 16 11.9753 15.2915 13.3011 14.0687L10.7231 12.0698C10.0058 12.5578 9.07988 12.8341 8.00106 12.8341C5.91398 12.8341 4.14436 11.426 3.50942 9.53296H0.849121V11.5936C2.2072 14.295 4.97332 16 7.99812 16Z"
        fill="#34A853"
      ></path>
      <path
        d="M3.50665 9.53295C3.17154 8.53938 3.17154 7.4635 3.50665 6.46993V4.4093H0.849292C-0.285376 6.66982 -0.285376 9.33306 0.849292 11.5936L3.50665 9.53295Z"
        fill="#FBBC04"
      ></path>
      <path
        d="M7.99812 3.16589C9.13867 3.14825 10.241 3.57743 11.067 4.36523L13.3511 2.0812C11.9048 0.723121 9.98526 -0.0235266 7.99812 -1.02057e-05C4.97332 -1.02057e-05 2.2072 1.70493 0.849121 4.40932L3.50648 6.46995C4.13848 4.57394 5.91104 3.16589 7.99812 3.16589Z"
        fill="#EA4335"
      ></path>
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="15.6825" height="16" fill="white"></rect>
      </clipPath>
    </defs>
  </svg>
);

export default LoginPage;
