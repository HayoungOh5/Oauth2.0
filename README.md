# Introduction

본 프로젝트는 Google OAuth2.0을 사용한 로그인에 대한 예제 프로젝트입니다. 

client, server가 모두 구현되어있습니다. (db 파트는 제외). 

예제 프로젝트로써 실제 프로덕트에 바로 적용하기에 보안적으로 권장되지 않습니다.

## Client
React를 사용하여 구현되었습니다. 주요 파일 정보는 다음과 같습니다.

- `src/`: 모든 소스 코드가 들어있는 폴더입니다.
  - `App.js`: 애플리케이션의 최상위 컴포넌트로, 라우팅 및 기본 레이아웃을 설정합니다. 해당 프로젝트의 client는 1 page로 구성되어있습니다.
  - `index.js`: React 애플리케이션의 진입점 파일로, DOM에 React 컴포넌트를 렌더링합니다.
- `.env`: **레파지토리에서 제공되지 않습니다. `.env_example` 파일을 참고하여 직접 생성하세요.**
- `package.json`: 프로젝트 디펜던시를 기록해놓은 json 파일입니다.

## Server
Node.js와 Express를 사용하여 구현되었습니다. 주요 파일 정보는 다음과 같습니다.

- `controllers/`: 비즈니스 로직을 처리하는 컨트롤러들이 모여 있는 폴더입니다.
  - `authController.js`: 사용자 인증과 관련된 모든 로직을 담당합니다. OAuth 2.0을 사용한 로그인, 로그아웃, 사용자 인증 등을 처리합니다.
  - `tokenController.js`: 토큰 발급과 관련된 로직을 처리합니다. 액세스 토큰 및 리프레시 토큰을 생성하고, 갱신하거나 검증하는 작업을 수행합니다.
  
- `index.js`: 서버의 진입점으로, Express 애플리케이션을 설정하고 필요한 미들웨어 및 라우터를 연결한 뒤 서버를 실행합니다.
- `routes/`: API 경로를 설정하는 파일들이 위치한 폴더입니다.
  - `authRoutes.js`: 사용자 인증과 관련된 라우트를 정의한 파일입니다. 경로는 아레 API Endpoints를 참고하세요.

- `utils/`: 유틸리티 함수들이 모여 있는 폴더로, 재사용 가능한 로직들을 모듈화합니다.
  - `verifyJwt.js`: JWT 토큰의 유효성을 확인하고 디코딩하는 유틸리티 함수가 들어있는 파일입니다. API 요청 시 토큰을 검증하는 데 사용됩니다.

- `.env`: **레파지토리에서 제공되지 않습니다. `.env_example` 파일을 참고하여 직접 생성하세요.**
- `package.json`: 프로젝트 디펜던시를 기록해놓은 json 파일입니다.


## API Endpoints

서버에서 제공하는 API는 사용자 인증 및 토큰 관리를 위해 아래의 엔드포인트를 제공합니다.

### 1. `GET /callback`
- **설명**: Google OAuth2.0 인증 후 콜백을 처리하여 인가 코드를 수신합니다.
- **Controller**: `tokenController.getCode`

### 2. `POST /auth/tokens`
- **설명**: 인가 코드를 통해 액세스 토큰과 리프레시 토큰을 발급받습니다.
- **Controller**: `tokenController.getTokens`

### 3. `POST /auth/refresh`
- **설명**: 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
- **Controller**: `tokenController.refreshToken`

### 4. `POST /auth/verify/accesstoken`
- **설명**: Google의 엔드포인트를 사용하여 액세스 토큰의 유효성을 검증합니다.
- **Controller**: `authController.verifyAccessToken`

### 5. `POST /auth/verify/idtoken/google`
- **설명**: Google의 엔드포인트를 사용하여 ID 토큰의 유효성을 검증합니다.
- **Controller**: `authController.verifyIdTokenByGoogle`

### 6. `POST /auth/verify/idtoken/server`
- **설명**: 서버 측에서 JWT를 직접 검증하여 ID 토큰의 유효성을 확인합니다.
- **Controller**: `authController.verifyIdTokenByServer`

## 구현 목록
1. Google OAuth2.0 로그인 (Access token 발급을 위한 Authorization token발급)
2. Authorization token으로 ID token, Access token, Refresh token 발급
3. 구글 엔드포인트를 통한 Access token 검증
4. 구글 엔드포인트를 통한 ID token 검증
5. Refresh token으로 Access token 재발급

# 실행
실행에 앞서 먼저 구글 클라이언트를 생성하여 .env 파일을 작성 해야 합니다. 아래 내용을 참고하세요.
리액트 페이지의 버튼이 정상 작동하기 위해서는 **항상 server가 켜져** 있어야함을 유의하세요.

## Google Cloud Platform (GCP) 설정

1. Google Cloud Console에 로그인합니다: [Google Cloud Console](https://console.cloud.google.com).
2. 새 프로젝트를 생성합니다.
3. OAuth 동의 화면을 구성합니다:
   * "사용자 유형"을 선택합니다 (일반적으로 "외부"를 선택합니다).
   * 앱 정보를 입력합니다 (앱 이름, 사용자 지원 이메일 등).
   * 저장 및 계속 버튼을 클릭하여 설정을 완료합니다.
4. OAuth 2.0 클라이언트 ID 생성:
   * "사용자 인증 정보" 섹션에서 "사용자 인증 정보 만들기"를 선택합니다.
   * "OAuth 클라이언트 ID"를 선택합니다.
   * "애플리케이션 유형"으로 "웹 애플리케이션"을 선택합니다.
   * 승인된 JavaScript 원본에는 다음의 URI를 추가합니다. (세 개 다 추가할 것을 권장):
     * http://localhost
     * http://127.0.0.1:3000
     * http://localhost:3000
   * 승인된 리디렉션 URI에는 다음의 URI를 추가합니다:
     * http://localhost:8080/callback
   * 생성된 클라이언트 ID와 클라이언트 시크릿을 기록해 둡니다. (.env 파일에 사용)

## Client 실행

`.env_example` 파일을 참고하여 `.env` 파일을 작성해주세요.

client 디렉토리 내에서 다음 명령어로 client를 실행합니다:
```bash
# dependency install
npm install
# run the client
npm run start
```

http://localhost:3000 에서 동작을 확인하실 수 있습니다.
로그인 버튼을 눌러도 정상적으로 작동하지 않는 경우, 캐시를 지우거나 **시크릿 창 모드**에서 실행해 보세요.
특히 여러번 반복하여 테스트할때 캐시에 따라 최초 토큰 이슈시 refresh 토큰이 발급되지 않는 경우가 있습니다.
**시크릿 창 모드**에서 사용하심을 권장드립니다.


## Server 실행

`.env_example` 파일을 참고하여 `.env` 파일을 작성해주세요.

server 디렉토리 내에서 다음 명령어로 server를 실행합니다:
```bash
# dependency install
npm install
# run the server
node index.js
```

## 사용 예시