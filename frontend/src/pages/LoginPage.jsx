import { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';
import InputField from '../components/InputField';
import { login } from '../api/auth';

/* Login Page Module */
export default function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'identifier') {
      const val = value.replace(/\s/g, '');
      if (!val) {
        error = 'Email or username is required';
      } else if (val.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          error = 'Please enter a valid email address';
        }
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = name === 'identifier' ? value.replace(/\s/g, '') : type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val
    }));

    if (touched[name]) {
      const err = validateField(name, val);
      setErrors((prev) => ({
        ...prev,
        [name]: err
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const identifierVal = formData.identifier.replace(/\s/g, '');
    const identifierErr = validateField('identifier', identifierVal);
    const passwordErr = validateField('password', formData.password);

    const validationErrors = {
      identifier: identifierErr,
      password: passwordErr
    };

    setTouched({
      identifier: true,
      password: true
    });

    setErrors(validationErrors);

    if (!identifierErr && !passwordErr) {
      setIsSubmitting(true);
      setRequestError('');
      try {
        const result = await login(identifierVal, formData.password);
        onLoginSuccess({ ...result, identifier: identifierVal });
      } catch (error) {
        setRequestError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f4f6fa]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
          <div className="bg-[#0f223d] text-white p-6 text-center">
            <img src="/logo.png" alt="Login X" className="w-14 h-14 mx-auto mb-3 rounded-full border border-white/20 shadow-md object-cover" />
            <h2 className="text-2xl font-bold tracking-wide">Sign In to Login X</h2>
            <p className="text-xs text-slate-300 mt-1 font-light">
              Official Citizen Authentication & Portal Access
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate>
              <InputField
                id="identifier"
                label="Email or Username"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.identifier ? errors.identifier : ''}
                placeholder="e.g. citizen_john or user@domain.com"
                icon={User}
                required
              />

              <InputField
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : ''}
                placeholder="Enter your password"
                icon={Lock}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0f223d] hover:bg-[#16335c] text-white font-medium py-3 px-4 rounded-md shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Authorize & Sign In'}</span>
                <ArrowRight size={16} />
              </button>
              {requestError && (
                <p role="alert" className="mt-3 text-sm text-red-600">{requestError}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
