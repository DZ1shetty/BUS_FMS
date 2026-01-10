import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';

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
            setError(err.message);
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
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4 font-['Rajdhani',sans-serif]">
            <div className="w-full max-w-md bg-dark-surface border border-slate-700/50 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                {/* Technical Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-tr-2xl rounded-bl-2xl border border-primary/20 mb-4 font-bold text-3xl">B</div>
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Create Account</h1>
                    <p className="text-slate-400 mt-2 uppercase tracking-tighter text-sm">Join the Fleet Network</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3 text-red-500 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="email"
                            required
                            placeholder="EMAIL ADDRESS"
                            className="w-full bg-dark/50 border border-slate-700/50 rounded lg py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-primary transition-all uppercase tracking-widest text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            required
                            placeholder="PASSWORD"
                            className="w-full bg-dark/50 border border-slate-700/50 rounded lg py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-primary transition-all uppercase tracking-widest text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            required
                            placeholder="CONFIRM PASSWORD"
                            className="w-full bg-dark/50 border border-slate-700/50 rounded lg py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-primary transition-all uppercase tracking-widest text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
                    >
                        <UserPlus size={20} />
                        <span>{loading ? 'PROCESSING...' : 'ESTABLISH ACCOUNT'}</span>
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700/50" /></div>
                        <span className="relative bg-dark-surface px-4 text-xs text-slate-500 uppercase tracking-widest">Or Register via</span>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full border border-slate-700/50 hover:border-primary/50 text-slate-300 py-3 rounded-lg flex items-center justify-center space-x-3 transition-all hover:bg-primary/5 group"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        <span className="uppercase tracking-widest text-xs font-bold group-hover:text-primary">Continue with Google</span>
                    </button>
                </div>

                <p className="mt-8 text-center text-slate-500 text-sm uppercase tracking-tighter">
                    Already a member? <Link to="/login" className="text-primary hover:underline ml-1">Access Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
