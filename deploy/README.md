# S3 정적 웹 호스팅 배포 자료

| 파일 | 용도 | 다루는 파트 |
|---|---|---|
| `s3-bucket-policy.json` | 버킷의 파일을 누구나 읽을 수 있게 하는 정책 (`BUCKET_NAME` 교체) | S16-P55 |
| `github-oidc-trust-policy.json` | GitHub Actions가 역할을 맡을 수 있게 하는 신뢰 정책 (`ACCOUNT_ID`, 저장소 이름 교체) | S16-P56 |
| `deploy-role-policy.json` | 배포 역할에 줄 최소 권한 (`BUCKET_NAME` 교체) | S16-P56 |

빌드할 때 `VITE_API_BASE_URL`에 백엔드의 공개 주소를 넣고, 백엔드 `CORS_ORIGINS`에는
S3 웹사이트 주소(`http://BUCKET_NAME.s3-website.ap-northeast-2.amazonaws.com`)를 등록합니다.
