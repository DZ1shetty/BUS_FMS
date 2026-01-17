import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import InteractiveBackground from './InteractiveBackground';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        setLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err) {
            console.error("Signup Error:", err);
            let msg = "Failed to create account.";
            if (err.code === 'auth/operation-not-allowed') msg = "Email/Password sign-in is not enabled. Please enable it in the Firebase Console.";
            else if (err.code === 'auth/email-already-in-use') msg = "This email is already in use.";
            else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            else if (err.code) msg = err.code.replace('auth/', '').replace(/-/g, ' ');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (err) {
            console.error("Google Sign In Error:", err);
            let msg = "Failed to sign in with Google.";
            if (err.code === 'auth/operation-not-allowed') msg = "Google sign-in is not enabled. Please enable it in the Firebase Console.";
            else if (err.code === 'auth/popup-closed-by-user') msg = "Sign-in popup was closed.";
            else if (err.code) msg = err.code.replace('auth/', '').replace(/-/g, ' ');
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-6">
            <InteractiveBackground />

            <div className="w-full max-w-md bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in">
                <div className="text-center mb-8">
                    <img src="/logo.jpg" alt="Logo" className="w-16 h-16 rounded-full shadow-2xl shadow-primary/30 mb-4 hover:scale-105 transition-transform" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create Account</h1>
                    <p className="text-slate-500 text-sm">Join BusFleet to get started</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="input-minimal pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                placeholder="Create a password"
                                className="input-minimal pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                placeholder="Confirm your password"
                                className="input-minimal pl-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-sm"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={18} />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full btn-secondary flex items-center justify-center gap-2.5 text-sm"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span>Sign up with Google</span>
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?
                        <Link to="/login" className="text-primary hover:text-primary-hover font-semibold ml-1">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
