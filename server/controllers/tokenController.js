// controllers/tokenController.js
const { json } = require('express');
const fetch = require('node-fetch');

const refreshTokens = {}; // 메모리에 리프레시 토큰 저장
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

exports.getCode = async (req, res)=> {
    const { code } = req.query; // 구글로부터 전달받은 authorization code
    console.log("authorize code from google")
    console.log(code)
    res.redirect('http://localhost:3000?auth_code=' + code);
}


// get access token and refresh token by authorization code
exports.getTokens = async (req, res) => {
  const { code } = req.body;

  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: 'http://localhost:8080/api/callback', // 서버 리디렉션 URI
    grant_type: 'authorization_code'
  });

  try 
    {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const data = await response.json();
      console.log("response");
      console.log(JSON.stringify(data));
      console.log(data);
      refreshTokens[data.id_token] = data.refresh_token;
  
      console.log(`Succeed to get an access token: ${data.access_token}`);
      console.log(`Stored a refresh token: ${data.refresh_token}`);
  
      res.status(200).json({ 
          status: 'success', 
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          idToken: data.id_token
      });
  } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({ status: 'error', message: error.message });
  }
};

//get new access token by refresh token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ status: 'error', message: 'Refresh token is required' });
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh tokens: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data)
    console.log(`Succeed to get a new access token: ${data.access_token}`);
    res.status(200).json({
      status: 'success',
      accessToken: data.access_token,
      refreshToken: null,
    });
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
