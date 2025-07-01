// GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axiosInstance';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    const fullName = searchParams.get('name');
    const avatar = searchParams.get('avatar');

    const loginWithGoogle = async () => {
      try {
        const res = await axios.post('/auth/google-login', {
          email,
          fullName,
          avatar
        });

        const { token, user } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('loginSuccess'));


        navigate(user.role === 'admin' ? '/admin/home' : '/home');
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    if (email && fullName) loginWithGoogle();
    else navigate('/login');
  }, [navigate, searchParams]);

  return <p>Đang xử lý đăng nhập với Google...</p>;
};

export default GoogleCallback;
