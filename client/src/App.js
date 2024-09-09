import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // React Router를 사용할 경우
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const api = process.env.REACT_APP_BACKEND_URL;

const App = () => {
  const [idToken, setIdToken] = useState(null);
  const [authCode, setAuthCode] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [accessTokenInfo, setAccessTokenInfo] = useState(null);
  const [idTokenInfo1, setIdTokenInfo1] = useState(null);
  const [idTokenInfo2, setIdTokenInfo2] = useState(null);

  const location = useLocation();
  const navigate = useNavigate(); // useNavigate 훅 사용
  
  useEffect(() => {
    // URL 쿼리 파라미터에서 Authorization Code를 추출합니다.
    const query = new URLSearchParams(location.search);
    const code = query.get('auth_code'); // URL에서 auth_code를 추출

    if (code) {
      setAuthCode(code);
      console.log('Authorization Code:', code);
      // 인증 코드 처리 후 리디렉션
      navigate('/', { replace: true }); // React Router를 통한 리디렉션
    }
  }, [location.search, navigate]);

  const getAuthCode = (clientId) => {
    const redirectUri = 'http://localhost:8080/api/callback';
    const responseType = 'code'; // Authorization code flow
    const scope = 'openid profile email'; // 요청할 범위
    const accessType = 'offline'; // 리프레시 토큰을 포함하기 위한 옵션

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}`;

    window.location.href = authUrl; // 구글 인증 페이지로 리디렉션
  };

  // issue access token, refresh token by Authorization Code at first time
  // verify id token
  const issueToken = async () => {
    console.log("issue token by code", authCode)
    try {
      const tokenResponse = await fetch(api + '/api/auth/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: authCode })
      });

      const res = await tokenResponse.json();
      if (res.status === "success") {
        console.log("id token & access token & refresh token issued");
        console.log(`access token : ${res.accessToken}`);
        console.log(`refresh token : ${res.refreshToken}`);
        setRefreshToken(res.refreshToken);
        setAccessToken(res.accessToken);
        setIdToken(res.idToken);
      } else {
        console.error('Failed to issue tokens:', res);
      }
    } catch(error) {
      console.error(error);
    }
  }

  // 리프레시 토큰을 사용하여 새로운 액세스 토큰을 요청하는 함수
  const getNewAccessToken = async () => {
    try {
      // 리프레시 토큰을 요청 본문에 포함
      const response = await fetch(api + '/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: refreshToken // 실제 리프레시 토큰을 여기 넣어야 합니다.
        })
      });

      const res = await response.json();

      if (res.status === "success") {
        console.log("get new accesstoken")
        console.log(`now access token is ${res.accessToken}`)
        setRefreshToken(res.refreshToken);
        setAccessToken(res.accessToken);
      } else {
        console.error('Failed to get new access tokens:', res);
      }
    } catch(error) {
      console.error(error);
    }
  };

  // Verify accessToken by Google Endpoint
  const verifyAccessTokenByGoogle = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    try {
      const response = await fetch(api + '/api/auth/verify/accesstoken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: accessToken }),
      });

      const data = await response.json();
      setAccessTokenInfo(data);

      if (data.status === 'success') {
        console.log('Token is valid:', data);
      } else {
        console.error('Token verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  };

  const verifyIdTokenByGoogle = async () => {
    if (!idToken) {
      console.error('No id token available');
      return;
    }

    try {
      const response = await fetch(api + '/api/auth/verify/idtoken/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: idToken })
      });

      const data = await response.json();
      console.log(data);

      if (data.status === 'success') {
        console.log(data.user)
        setIdTokenInfo1(data.user);
      } else {
        console.error('Token verification failed');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
}

  // by our server
  const verifyIdTokenByServer = async () => {
    if (!idToken) {
      console.error('No id token available');
      return;
    }

    try {
      const response = await fetch(api + '/api/auth/verify/idtoken/server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();
      console.log(data);

      if (data.status === 'success') {
        console.log('Token is valid:', data);
        setIdTokenInfo2(data.user);
      } else {
        console.error('Token verification failed:', data.message);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  };

  return (
    <div className="App">
      <h1>Google OAuth 2.0 Login</h1>
      <button onClick={() => getAuthCode(process.env.REACT_APP_GOOGLE_CLIENT_ID)}>
        Login with Google
      </button>
  
      {/* Auth code */}
      {authCode ? <h3>✅ Log in</h3> : <h3>⚠️ Before Log in</h3>}
      <h4>{`Authorization Code: ${authCode}`}</h4>
  
      {/* Token issue buttons */}
      <div>
        <button onClick={issueToken} style={{ marginRight: '10px' }}>최초 토큰 이슈</button>
        <button onClick={getNewAccessToken}>새 액세스 토큰</button>
      </div>
  
      {/* Token display */}
      <div>
        <h3>ID Token</h3>
        <p>{idToken || 'null'}</p>
        <h3>Access Token</h3>
        <p>{accessToken || 'null'}</p>
        <h3>Refresh Token</h3>
        <p>{refreshToken || 'null'}</p>
      </div>
  
      {/* Access Token verification */}
      <h3>Verify Access Token</h3>
      <button onClick={verifyAccessTokenByGoogle} style={{ marginRight: '10px' }}>
        구글 엔드포인트를 통한 Access token 검증 요청
      </button>
      {accessTokenInfo && (
        <div>
          <p>Result of Access Token Validation By Google</p>
          <pre>{JSON.stringify(accessTokenInfo, null, 2)}</pre>
        </div>
      )}
  
      {/* ID Token verification */}
      <h3>Verify ID Token</h3>
      <button onClick={verifyIdTokenByGoogle} style={{ marginRight: '10px' }}>
        구글 엔드포인트를 통한 ID Token 검증 요청
      </button>
      {idTokenInfo1 && (
        <div>
          <p>Result of ID Token Validation By Google</p>
          <pre>{JSON.stringify(idTokenInfo1, null, 2)}</pre>
        </div>
      )}
      <button onClick={verifyIdTokenByServer} style={{ marginRight: '10px' }}>
        서버를 통한 ID Token 검증 요청
      </button>
      {idTokenInfo2 && (
        <div>
          <p>Result of ID Token Validation By Server</p>
          <pre>{JSON.stringify(idTokenInfo2, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;
