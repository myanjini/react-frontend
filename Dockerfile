# 1단계: Node.js로 정적 파일을 빌드합니다.
FROM node:24-alpine AS build
WORKDIR /app

# 의존성 목록만 먼저 복사하면 소스가 바뀌어도 설치 단계 캐시를 다시 씁니다.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# VITE_ 값은 빌드할 때 코드에 새겨집니다. 실행할 때 바꿀 수 없습니다.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 2단계: 빌드 결과물만 Nginx 이미지에 담습니다. Node.js와 소스 코드는 들어가지 않습니다.
# nginx-unprivileged 이미지는 root가 아닌 사용자로 8080 포트에서 실행됩니다.
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1
