
import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch, useSelector } from "react-redux";
import { setUser, loginUser, sendOTP, sendLoginOTP, verifyOTP } from "../context-api/authSlice";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const { loading: reduxLoading, error: reduxError, isOTPSent } = useSelector(state => state.auth || {});

  const [loginMode, setLoginMode] = useState("password");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [patientUser, setPatientUser] = useState(null); // for patient userType check

  useEffect(() => { localStorage.removeItem("user"); }, []);

  // Check if the entered phone/email is a patient user (from mockapi)
  useEffect(() => {
    if (!phoneOrEmail) {
      setPatientUser(null);
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await axios.get('https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users');
        const user = res.data.find(u => u.phone === phoneOrEmail || u.email === phoneOrEmail);
        if (user && user.userType === 'patient') {
          setPatientUser(user);
        } else {
          setPatientUser(null);
        }
      } catch {
        setPatientUser(null);
      }
    };
    fetchUser();
  }, [phoneOrEmail]);

  // Predefined users for non-patient login
  const mockLogin = async ({ phoneOrEmail, password }) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = [
        { phone: "9067800201", email: "doctor@mail.com", password: "Doctor@123", userType: "doctor" },
        { phone: "9370672873", email: "lab@mail.com", password: "Lab@123", userType: "lab" },
        { phone: "9876543210", email: "hospital@mail.com", password: "Hospital@123", userType: "hospital" },
        { phone: "9999999999", email: "superadmin@mail.com", password: "SuperAdmin@123", userType: "superadmin" },
      ];
      const user = users.find(u => (u.phone === phoneOrEmail || u.email === phoneOrEmail) && u.password === password);
      user ? resolve({ success: true, userType: user.userType, phone: user.phone }) : reject(new Error("Invalid credentials"));
    }, 1000);
  });

  const mockSendOtp = async (phone) => new Promise((resolve) => {
    setTimeout(() => { resolve("123456"); }, 1000);
  });

  const mockVerifyOtp = async (phone, otp) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp === "123456") {
        const users = [
          { phone: "9067800201", userType: "doctor" },
          { phone: "9370672873", userType: "lab" },
          { phone: "9876543210", userType: "hospital" },
          { phone: "9999999999", userType: "superadmin" },
        ];
        const user = users.find(u => u.phone === phone);
        user ? resolve({ success: true, userType: user.userType, phone: user.phone }) : reject(new Error("User not found"));
      } else {
        reject(new Error("Invalid OTP"));
      }
    }, 1000);
  });

  // Helper to check if patient login (by userType from mockapi)
  const isPatientLogin = () => {
    return !!patientUser;
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isPatientLogin()) {
        if (loginMode === "password") {
          // Patient password login via Redux (email and password)
          const resultAction = await dispatch(loginUser({ email: patientUser.email, password }));
          if (loginUser.fulfilled.match(resultAction)) {
            navigate("/patientdashboard");
          } else {
            setError(resultAction.payload || "Login failed. Please check your credentials.");
          }
        } else {
          // Patient OTP login via Redux
          const resultAction = await dispatch(verifyOTP({ phone: patientUser.phone, otp, type: "login" }));
          if (verifyOTP.fulfilled.match(resultAction)) {
            navigate("/patientdashboard");
          } else {
            setError(resultAction.payload || "OTP verification failed");
          }
        }
      } else if (loginMode === "password") {
        // Use mockLogin for all other users
        const { userType, phone } = await mockLogin({ phoneOrEmail, password });
        const userData = { userType, phone };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "dummyToken");
        dispatch(setUser(userData));
        if (userType === "superadmin") navigate("/superadmindashboard");
        else if (userType === "doctor") navigate("/doctordashboard");
        else if (userType === "lab") navigate("/labdashboard");
        else if (userType === "hospital") navigate("/hospitaldashboard");
      } else {
        // OTP login for non-patient users (mock)
        const { userType, phone } = await mockVerifyOtp(phoneOrEmail, otp);
        const userData = { userType, phone };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "dummyToken");
        dispatch(setUser(userData));
        if (userType === "superadmin") navigate("/superadmindashboard");
        else if (userType === "doctor") navigate("/doctordashboard");
        else if (userType === "lab") navigate("/labdashboard");
        else if (userType === "hospital") navigate("/hospitaldashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      if (isPatientLogin()) {
        // Patient login OTP via Redux
        const resultAction = await dispatch(sendLoginOTP(patientUser.phone));
        if (sendLoginOTP.fulfilled.match(resultAction)) {
          setOtpSent(true);
        } else {
          setError(resultAction.payload || "Failed to send OTP.");
        }
      } else {
        await mockSendOtp(phoneOrEmail);
        setOtpSent(true);
      }
    } catch {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f9fc]">
      <div className="flex items-center w-full max-w-4xl bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <div className="w-full max-w-md">
          <h2 className="h2-heading text-center mb-6">Login to Your Account</h2>
          <div className="flex justify-center mb-6">
            <button type="button" className={`px-6 py-2 font-semibold focus:outline-none ${loginMode === "password" ? "border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]" : "text-gray-500"}`} onClick={() => { setLoginMode("password"); setOtpSent(false); setOtp(""); setError(""); }}>Password</button>
            <button type="button" className={`px-6 py-2 font-semibold focus:outline-none ${loginMode === "otp" ? "border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]" : "text-gray-500"}`} onClick={() => { setLoginMode("otp"); setOtpSent(false); setOtp(""); setError(""); }}>OTP</button>
          </div>
          
          {/* PASSWORD LOGIN */}
          {loginMode === "password" && (
            <form onSubmit={handleLogin}>
              <div className="floating-input relative w-full mb-6" data-placeholder="Phone or Email">
                <input type="text" value={phoneOrEmail} onChange={e => setPhoneOrEmail(e.target.value)} className="input-field peer" />
              </div>
              <div className="floating-input relative w-full mb-6" data-placeholder="Password">
                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field peer pr-10" />
                <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-[var(--primary-color)] focus:outline-none" onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {(isPatientLogin() && reduxError) ? <p className="error-text mb-4">{reduxError}</p> : error && <p className="error-text mb-4">{error}</p>}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-[var(--accent-color)]" />
                  <span>Remember me</span>
                </label>
                <span className="text-sm text-[var(--accent-color)] hover:underline cursor-pointer">Forgot Password?</span>
              </div>
              <button type="submit" className={`btn btn-primary w-full${(isPatientLogin() ? reduxLoading : loading) ? " btn-disabled" : ""}`} disabled={isPatientLogin() ? reduxLoading : loading}>{(isPatientLogin() ? reduxLoading : loading) ? "Logging in..." : "Login"}</button>
            </form>
          )}

          {/* OTP LOGIN */}
          {loginMode === "otp" && (
            <>
              <div className="floating-input relative w-full mb-6" data-placeholder="Phone Number">
                <input type="tel" value={phoneOrEmail} onChange={e => setPhoneOrEmail(e.target.value)} className="input-field peer" />
              </div>
              {!otpSent && (
                <button type="button" className="btn btn-primary w-full mb-6" onClick={handleSendOtp} disabled={loading || !phoneOrEmail}>{loading ? "Sending OTP..." : "Send OTP"}</button>
              )}
              {otpSent && (
                <form onSubmit={handleLogin}>
                  <div className="floating-input relative w-full mb-6" data-placeholder="Enter OTP">
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="input-field peer" maxLength={6} />
                  </div>
                  {error && <p className="error-text mb-4">{error}</p>}
                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-[var(--accent-color)]" />
                      <span>Remember me</span>
                    </label>
                    <span className="text-sm text-[var(--accent-color)] hover:underline cursor-pointer">Forgot Password?</span>
                  </div>
                <button type="submit" className={`btn btn-primary w-full${(isPatientLogin() ? reduxLoading : loading) ? " btn-disabled" : ""}`} disabled={(isPatientLogin() ? reduxLoading : loading) || !otp}>{(isPatientLogin() ? reduxLoading : loading) ? "Verifying..." : "Verify OTP & Login"}</button>
                </form>
              )}
            </>
          )}

          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <span className="text-[var(--accent-color)] hover:underline cursor-pointer" onClick={() => navigate("/register")}>Register</span>
          </p>
        </div>
        <div className="w-full max-w-xs ml-8">
          <img src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg" alt="Login illustration" className="w-full h-auto rounded-xl animate-slideIn" />
        </div>
      </div>
    </div>
  );
};

export default Login;
