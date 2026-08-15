'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function GoogleAuthButton() {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const base64Payload = credentialResponse.credential.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));

      const res = await api.post('/auth/google', {
        google_id: payload.sub,
        email: payload.email,
        nom: payload.family_name || payload.name || '',
        prenom: payload.given_name || '',
        avatar_url: payload.picture,
      });

      localStorage.setItem('kollecta_token', res.token);
      setUser(res.user);
      router.push('/');
    } catch (err) {
      alert('Connexion Google échouée. Réessayez.');
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert('Connexion Google échouée.')}
        text="continue_with"
        locale="fr"
      />
    </div>
  );
}
