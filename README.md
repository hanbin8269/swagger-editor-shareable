# 🔗 Shareable Swagger Editor

OpenAPI JSON을 쿼리 파라미터에 저장해서 링크로 공유할 수 있는 Swagger 에디터입니다.

## ✨ 특징

- 📝 **실시간 JSON 에디터**: OpenAPI 3.0 스키마 편집
- 🔗 **링크 공유**: URL에 스키마를 저장해서 공유
- 👁️ **실시간 미리보기**: 실제 Swagger UI로 렌더링
- 📤 **파일 업로드/다운로드**: JSON 파일 직접 처리
- 🎯 **API 테스트**: Try it out 기능으로 실제 API 호출
- ⚡ **TypeScript 지원**: 타입 안전성과 더 나은 개발 경험
- 🚀 **Next.js App Router**: 최신 Next.js 구조 사용

## 🚀 배포된 버전

**Live Demo**: [https://your-app.vercel.app](https://your-app.vercel.app)

## 🛠️ 로컬 개발

### 요구사항
- Node.js 18.17 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/swagger-editor-shareable.git
cd swagger-editor-shareable

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열기
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 정적 분석
npm run lint
```

## 📁 프로젝트 구조

```
swagger-editor-shareable/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지
│   │   └── globals.css         # 글로벌 스타일
│   └── components/
│       └── SwaggerEditor.tsx   # 메인 컴포넌트
├── public/                     # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## 📖 사용법

### 1. 스키마 입력
왼쪽 에디터에 OpenAPI 3.0 JSON 스키마를 입력하거나 파일을 업로드하세요.

### 2. 링크 생성
"공유 링크 생성" 버튼을 클릭하여 공유 가능한 URL을 생성하세요.

### 3. 링크 공유
생성된 URL을 복사해서 다른 사람들과 공유하세요.

### 4. 미리보기
"미리보기" 탭에서 실제 Swagger UI로 렌더링된 API 문서를 확인하세요.

## 🎯 주요 기능

### 실시간 JSON 유효성 검사
입력한 JSON의 문법 오류를 실시간으로 감지합니다.

### URL 기반 스키마 공유
스키마가 Base64로 인코딩되어 URL 쿼리 파라미터에 저장됩니다.

### Swagger UI 통합
실제 Swagger UI Bundle을 사용하여 완전한 API 문서를 렌더링합니다.

### 파일 처리
- JSON 파일 업로드
- 편집된 스키마 다운로드
- 드래그 앤 드롭 지원

## 🔧 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Docs**: Swagger UI Bundle
- **Deployment**: Vercel

## 🌐 Vercel 배포

### 자동 배포
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 임포트
3. 자동으로 빌드 및 배포

### 수동 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🐛 버그 리포트

버그를 발견했거나 기능 요청이 있으시면 [GitHub Issues](https://github.com/YOUR_USERNAME/swagger-editor-shareable/issues)에 등록해주세요.

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 통해 연락해주세요.

---

⭐ 이 프로젝트가 유용하다면 스타를 눌러주세요!