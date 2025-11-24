import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UpdatePassword: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!passwords.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
      isValid = false;
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
      isValid = false;
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      isValid = false;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await updatePassword(passwords.newPassword);
      toast.success('Senha atualizada com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Atualizar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            Digite sua nova senha
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="sr-only">Nova senha</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={passwords.newPassword}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nova senha (mínimo 6 caracteres)"
              />
              {errors.newPassword && <span className="text-red-300 text-sm mt-1 block">{errors.newPassword}</span>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirmar nova senha</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirmar nova senha"
              />
              {errors.confirmPassword && <span className="text-red-300 text-sm mt-1 block">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Atualizando...
                </span>
              ) : (
                '🔐 Atualizar Senha'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
