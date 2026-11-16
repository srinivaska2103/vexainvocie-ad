'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2, RotateCw, ShieldCheck } from 'lucide-react';
import { superAdminService } from '@/services/superAdminService';
import { useSuperAdminStore } from '@/store/useSuperAdminStore';

export default function LoginPage() {
  const router = useRouter();
  const loginToStore = useSuperAdminStore((state) => state.login);

  // Email input is empty by default so it must be entered by admin
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('REQUEST_OTP'); // 'REQUEST_OTP' | 'VERIFY_OTP'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP - user enters email, verified on backend
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = (email || '').trim().toLowerCase().replace(/[\\/]/g, '').trim();
    if (!cleanEmail) {
      setError('Please enter your Super Admin email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await superAdminService.sendOtp(cleanEmail);
      setSuccessMsg(res?.message || 'Verification OTP sent to your email.');
      setStep('VERIFY_OTP');
    } catch (err) {
      setError(err.data?.message || err.message || 'Access Denied: Unrecognized or unauthorized Super Admin email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and redirect to dashboard
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = (email || '').trim().toLowerCase().replace(/[\\/]/g, '').trim();
    const cleanOtp = (otp || '').trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await superAdminService.verifyOtp(cleanEmail, cleanOtp);
      if (res?.data?.token && res?.data?.admin) {
        loginToStore(res.data.admin, res.data.token);
        router.push('/');
      } else {
        throw new Error('Invalid authentication response from server.');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 text-center">
        {/* VEXA TECH Official Logo */}
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 inline-flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="VEXA TECH"
              width={64}
              height={64}
              priority
              className="w-14 h-14 object-contain rounded-xl"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          VEXA TECH
        </h2>
        <p className="mt-1 text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Control Panel</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Platform-level SaaS administration portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-blue-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 'REQUEST_OTP' ? (
            /* Step 1: Admin enters email to receive OTP */
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Super Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter admin email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter your registered platform admin email to receive the 6-digit verification code.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Checking Email & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Admin enters OTP received via email */
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-center tracking-[0.4em] font-mono text-xl font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                  Verification code dispatched to <span className="font-semibold text-blue-700">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setStep('REQUEST_OTP'); setOtp(''); setError(''); }}
                  className="text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Protected platform area. All administrative authentication attempts and sessions are cryptographically logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
