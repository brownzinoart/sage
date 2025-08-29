import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Calendar } from 'lucide-react';

interface AgeVerificationProps {
  onVerified: () => void;
  minAge?: number;
  state?: string;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ 
  onVerified, 
  minAge = 21,
  state = "NJ" 
}) => {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('age_verified');
    const verificationDate = localStorage.getItem('verification_date');
    
    if (verified === 'true' && verificationDate) {
      const daysSinceVerification = Math.floor(
        (Date.now() - parseInt(verificationDate)) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceVerification < 30) {
        onVerified();
      } else {
        localStorage.removeItem('age_verified');
        localStorage.removeItem('verification_date');
      }
    }
  }, [onVerified]);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!birthDate) {
      setError('Please enter your date of birth');
      return;
    }

    const age = calculateAge(birthDate);

    if (age < minAge) {
      setError(`You must be ${minAge} or older to access this content`);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('age_verified', 'true');
      localStorage.setItem('verification_date', Date.now().toString());
    }

    onVerified();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Age Verification Required
          </h2>
          
          <p className="text-gray-600">
            You must be {minAge} or older to access cannabis products in {state}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
              Remember my verification for 30 days
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Verify Age
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By entering this site, you agree to comply with all local and state laws regarding cannabis purchase and consumption. 
            Cannabis products have not been evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="https://www.nj.gov/cannabis/" className="text-xs text-blue-600 hover:underline">
            Learn about NJ Cannabis Laws
          </a>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;