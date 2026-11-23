# react-frontend

`React로 만드는 도서 관리 프론트엔드와 관제 대시보드` 과정의 실습 코드 저장소입니다.

- 교안: https://myanjini.github.io/react-frontend/index.html
- 연계 백엔드 과정: https://myanjini.github.io/fastapi-rest-api/index.html

## 브랜치

코드가 바뀌는 파트마다 그 파트를 마친 상태를 `pN-done` 브랜치로 남겨 두었습니다.
실습하다 막히면 해당 브랜치와 내 코드를 비교해 다른 곳을 찾습니다. 통째로 복사하지 않습니다.

```bash
git fetch origin
git diff p21-done -- src        # 내 코드와 P21 완성 코드 비교
git switch -c my-p21 origin/p21-done   # 필요하면 그 시점부터 새로 시작
```

`main` 브랜치는 과정을 모두 마친 최종 코드입니다.

## 실행

```bash
npm install
npm run dev
```

백엔드(도서 관리 API)가 `http://127.0.0.1:8000`에서 실행 중이어야 합니다.
