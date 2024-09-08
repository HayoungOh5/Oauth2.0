// controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const { verifyIdToken } = require('../utils/verifyJwt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.verifyAccessToken = async (req, res) => {
  const accessToken = req.body.token;
  console.log("The given access_token is", accessToken);

  try {
    // Google's Tokeninfo 엔드포인트에 GET 요청을 보내서 access token을 검증합니다.
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);

    if (!response.ok) {
      // 응답이 정상적이지 않을 경우 (토큰이 유효하지 않거나 만료된 경우)
      console.log(response);
      throw new Error('Invalid access token');
    }

    const data = await response.json();
    
    // 응답 데이터 출력 (token이 유효하면 user_id 및 기타 정보 포함)
    console.log('Token info:', data);

    res.json({ status: 'success', tokenInfo: data });
  } catch (error) {
    console.error('Error verifying access token:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.verifyIdTokenByGoogle = async (req, res) => {
  const token = req.body.token;
  console.log("the given id_token is ", token)

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    res.json({ status: 'success', user: payload });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error });
  }
};


exports.verifyIdTokenByServer = async (req, res) => {
  const token = req.body.token;
  console.log("the given id_token is ", token)
  const result = await verifyIdToken(token);

  if (result.status === 'success') {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
};