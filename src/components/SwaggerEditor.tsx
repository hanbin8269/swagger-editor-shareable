'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Copy, Share, Upload, Download, Eye, Code } from 'lucide-react';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
}

declare global {
  interface Window {
    SwaggerUIBundle: {
      (config: Record<string, unknown>): void;
      presets: {
        apis: unknown;
        standalone: unknown;
      };
    };
    LZString: {
      compressToEncodedURIComponent: (input: string) => string;
      decompressFromEncodedURIComponent: (input: string) => string | null;
    };
  }
}

const SwaggerEditor: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [currentSpec, setCurrentSpec] = useState<OpenAPISpec | null>(null);
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const swaggerUIRef = useRef<HTMLDivElement>(null);
  const [swaggerUILoaded, setSwaggerUILoaded] = useState<boolean>(false);
  const [lzStringLoaded, setLzStringLoaded] = useState<boolean>(false);

  // 예제 OpenAPI 스키마
  const exampleSchema: OpenAPISpec = {
    "openapi": "3.0.0",
    "info": {
      "title": "Pet Store API",
      "version": "1.0.0",
      "description": "A simple pet store API example"
    },
    "servers": [{ "url": "https://api.petstore.com/v1" }],
    "paths": {
      "/pets": {
        "get": {
          "summary": "List all pets",
          "operationId": "listPets",
          "responses": {
            "200": {
              "description": "A list of pets",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": { "$ref": "#/components/schemas/Pet" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Pet": {
          "type": "object",
          "required": ["id", "name"],
          "properties": {
            "id": { "type": "integer", "format": "int64" },
            "name": { "type": "string" },
            "status": { "type": "string", "enum": ["available", "pending", "sold"] }
          }
        }
      }
    }
  };

  // SwaggerUI와 LZ-string 라이브러리 로드
  useEffect(() => {
    const loadLibraries = () => {
      // SwaggerUI 로드
      if (typeof window !== 'undefined' && !window.SwaggerUIBundle) {
        const swaggerScript = document.createElement('script');
        swaggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js';
        swaggerScript.onload = () => setSwaggerUILoaded(true);
        document.head.appendChild(swaggerScript);

        const swaggerStyle = document.createElement('link');
        swaggerStyle.rel = 'stylesheet';
        swaggerStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css';
        document.head.appendChild(swaggerStyle);
      }

      // LZ-string 로드
      if (typeof window !== 'undefined' && !window.LZString) {
        const lzScript = document.createElement('script');
        lzScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js';
        lzScript.onload = () => setLzStringLoaded(true);
        document.head.appendChild(lzScript);
      } else if (window.LZString) {
        setLzStringLoaded(true);
      }
    };

    loadLibraries();
  }, []);

  // SwaggerUI 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && swaggerUILoaded && currentSpec && activeTab === 'preview' && swaggerUIRef.current) {
      try {
        window.SwaggerUIBundle({
          dom_id: '#swagger-ui-container',
          spec: currentSpec,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIBundle.presets.standalone
          ],
          layout: "BaseLayout",
          deepLinking: true,
          showExtensions: true,
          showCommonExtensions: true
        });
      } catch {
        console.error('SwaggerUI 초기화 오류');
      }
    }
  }, [swaggerUILoaded, currentSpec, activeTab]);

  // URL에서 스키마 로드 (압축 지원)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const encodedSchema = urlParams.get('schema');
      
      if (encodedSchema) {
        try {
          let decodedSchema: string;
          
          // 압축 형식 감지 및 디코딩
          if (encodedSchema.startsWith('lz:')) {
            // LZ-string 압축 디코딩
            if (lzStringLoaded && window.LZString) {
              const compressed = encodedSchema.substring(3); // 'lz:' 제거
              const decompressed = window.LZString.decompressFromEncodedURIComponent(compressed);
              if (decompressed === null) throw new Error('LZ 압축 해제 실패');
              decodedSchema = decompressed;
              console.log('🗜️ LZ 압축 해제 완료');
            } else {
              throw new Error('LZ-string 라이브러리 로딩 필요');
            }
          } else if (encodedSchema.startsWith('b64:')) {
            // Base64 디코딩
            const base64Data = encodedSchema.substring(4); // 'b64:' 제거
            decodedSchema = decodeURIComponent(atob(base64Data));
            console.log('📦 Base64 디코딩 완료');
          } else {
            // 레거시 지원 (접두사 없음 = Base64)
            decodedSchema = decodeURIComponent(atob(encodedSchema));
            console.log('🔄 레거시 Base64 디코딩');
          }
          
          const parsedSchema = JSON.parse(decodedSchema);
          setJsonInput(JSON.stringify(parsedSchema, null, 2));
          setCurrentSpec(parsedSchema);
          setIsValidJson(true);
          
        } catch (error) {
          console.error('URL에서 스키마 로드 실패:', error);
          // URL에서 로드 실패 시 기본 예제 로드
          setJsonInput(JSON.stringify(exampleSchema, null, 2));
          setCurrentSpec(exampleSchema);
          alert('공유된 스키마를 로드하는데 실패했습니다. 기본 예제를 로드합니다.');
        }
      } else {
        setJsonInput(JSON.stringify(exampleSchema, null, 2));
        setCurrentSpec(exampleSchema);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lzStringLoaded]); // LZ-string 로딩 완료 후 재시도

  const validateAndParseJson = (jsonString: string): OpenAPISpec | null => {
    try {
      const parsed = JSON.parse(jsonString);
      setCurrentSpec(parsed);
      setIsValidJson(true);
      return parsed;
    } catch {
      setIsValidJson(false);
      return null;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    if (value.trim()) {
      validateAndParseJson(value);
    }
  };

  const generateShareableUrl = () => {
    if (!isValidJson || !jsonInput.trim()) {
      alert('유효한 JSON을 입력해주세요.');
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        // 1단계: JSON 최소화 (공백 제거)
        const minifiedJson = JSON.stringify(JSON.parse(jsonInput));
        const originalSize = jsonInput.length;
        
        let finalEncoded: string;
        let compressionInfo: string;
        
        if (lzStringLoaded && window.LZString) {
          // 2단계: LZ-string 압축 적용
          const compressed = window.LZString.compressToEncodedURIComponent(minifiedJson);
          
          // 3단계: 기존 방식과 비교
          const traditionalEncoded = btoa(encodeURIComponent(minifiedJson));
          
          // 더 짧은 방식 선택
          if (compressed.length < traditionalEncoded.length) {
            finalEncoded = 'lz:' + compressed; // LZ 압축 표시
            compressionInfo = `LZ 압축 사용: ${originalSize}자 → ${compressed.length}자 (${Math.round((1 - compressed.length / originalSize) * 100)}% 압축)`;
          } else {
            finalEncoded = 'b64:' + traditionalEncoded; // Base64 압축 표시
            compressionInfo = `Base64 사용: ${originalSize}자 → ${traditionalEncoded.length}자 (${Math.round((1 - traditionalEncoded.length / originalSize) * 100)}% 압축)`;
          }
        } else {
          // LZ-string 로딩 안됨 - 기존 방식 사용
          finalEncoded = 'b64:' + btoa(encodeURIComponent(minifiedJson));
          compressionInfo = `Base64 사용: ${originalSize}자 → ${finalEncoded.length}자 (LZ-string 로딩 중...)`;
        }
        
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}?schema=${finalEncoded}`;
        
        // 압축 결과 로깅 및 저장
        console.log('🗜️ 압축 결과:', compressionInfo);
        console.log(`📏 최종 URL 길이: ${url.length}자`);
        setCompressionStats(compressionInfo);
        
        // URL 길이 체크
        if (url.length > 16384) {
          const proceed = confirm(`생성된 URL이 깁니다 (${url.length}자).\n${compressionInfo}\n\n일부 서버에서 문제가 될 수 있습니다. 계속하시겠습니까?`);
          if (!proceed) return;
        } else {
          // 성공 메시지로 압축 결과 표시
          console.log('✅ ' + compressionInfo);
        }
        
        setShareableUrl(url);
        window.history.pushState({}, '', url);
        
      } catch (error) {
        console.error('URL 생성 오류:', error);
        alert('URL 생성 중 오류가 발생했습니다. JSON 형식을 확인해주세요.');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
        validateAndParseJson(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadJson = () => {
    if (!currentSpec) return;
    const blob = new Blob([JSON.stringify(currentSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSwaggerUI = () => {
    if (!currentSpec) {
      return (
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{
              width: '64px', height: '64px', margin: '0 auto 16px',
              background: '#f3f4f6', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Code style={{ width: '32px', height: '32px', color: '#6b7280' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              스키마가 없습니다
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              에디터 탭에서 OpenAPI JSON을 입력해주세요.
            </p>
            <button
              onClick={() => setActiveTab('editor')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', background: '#111827', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '500'
              }}
            >
              <Code style={{ width: '16px', height: '16px' }} />
              에디터로 이동
            </button>
          </div>
        </div>
      );
    }

    if (!swaggerUILoaded) {
      return (
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 16px',
            background: '#f3f4f6', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Eye style={{ width: '32px', height: '32px', color: '#6b7280' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            Swagger UI 로딩 중...
          </h3>
          <p style={{ color: '#6b7280' }}>잠시만 기다려주세요</p>
        </div>
      );
    }

    return <div id="swagger-ui-container" ref={swaggerUIRef} style={{ minHeight: '400px' }} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .editor-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
          @media (min-width: 1024px) { .editor-grid { grid-template-columns: 1fr 1fr; } }
          #swagger-ui-container .swagger-ui .topbar { display: none; }
          #swagger-ui-container .swagger-ui .info { margin: 20px 0; }
          #swagger-ui-container { padding: 20px; }
        `
      }} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', background: '#f3f4f6',
            borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb'
          }}>
            <Code style={{ width: '32px', height: '32px', color: '#374151' }} />
          </div>
          <h1 style={{
            fontSize: '48px', fontWeight: 'bold', color: '#111827',
            marginBottom: '16px', margin: '0 0 16px 0'
          }}>
            Swagger Editor
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            OpenAPI 스키마를 편집하고 링크로 공유하세요
          </p>
        </header>

        {/* 탭 네비게이션 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: '12px', padding: '4px', display: 'inline-flex'
          }}>
            <button
              style={{
                padding: '12px 24px', fontWeight: '600', borderRadius: '8px',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                ...(activeTab === 'editor' 
                  ? { background: 'white', color: '#1f2937', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
                  : { background: 'transparent', color: '#6b7280' }
                )
              }}
              onClick={() => setActiveTab('editor')}
            >
              <Code style={{ width: '16px', height: '16px' }} />
              에디터
            </button>
            <button
              style={{
                padding: '12px 24px', fontWeight: '600', borderRadius: '8px',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                ...(activeTab === 'preview' 
                  ? { background: 'white', color: '#1f2937', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
                  : { background: 'transparent', color: '#6b7280' }
                )
              }}
              onClick={() => setActiveTab('preview')}
            >
              <Eye style={{ width: '16px', height: '16px' }} />
              미리보기
            </button>
          </div>
        </div>

        {activeTab === 'editor' && (
          <div className="editor-grid">
            {/* 에디터 패널 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '16px'
                }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    JSON 에디터
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ cursor: 'pointer' }}>
                      <input type="file" accept=".json,.yaml,.yml" onChange={handleFileUpload} style={{ display: 'none' }} />
                      <div style={{
                        padding: '8px', color: '#6b7280', borderRadius: '8px',
                        transition: 'all 0.2s', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb'
                      }}>
                        <Upload style={{ width: '20px', height: '20px' }} />
                      </div>
                    </label>
                    <button
                      onClick={downloadJson}
                      disabled={!currentSpec}
                      style={{
                        padding: '8px', color: currentSpec ? '#6b7280' : '#d1d5db',
                        background: 'transparent', border: '1px solid #e5e7eb',
                        borderRadius: '8px', cursor: currentSpec ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <Download style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder="OpenAPI JSON 스키마를 입력하세요..."
                  style={{
                    width: '100%', height: '320px', padding: '16px',
                    border: `2px solid ${isValidJson ? '#e5e7eb' : '#ef4444'}`,
                    borderRadius: '8px', fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '14px', resize: 'none', outline: 'none',
                    backgroundColor: isValidJson ? 'white' : '#fef2f2', transition: 'border-color 0.2s'
                  }}
                />
                
                {!isValidJson && (
                  <div style={{
                    marginTop: '12px', padding: '12px', background: '#fee2e2',
                    border: '1px solid #fecaca', borderRadius: '8px',
                    color: '#dc2626', fontSize: '14px'
                  }}>
                    ⚠️ JSON 형식이 올바르지 않습니다
                  </div>
                )}
              </div>

              <button
                onClick={generateShareableUrl}
                disabled={!isValidJson || !jsonInput.trim()}
                style={{
                  width: '100%', padding: '16px 24px', borderRadius: '12px',
                  border: 'none', fontWeight: '600', fontSize: '16px',
                  cursor: isValidJson && jsonInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', transition: 'all 0.2s',
                  ...(isValidJson && jsonInput.trim() 
                    ? { background: '#111827', color: 'white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }
                    : { background: '#f3f4f6', color: '#9ca3af' }
                  )
                }}
              >
                <Share style={{ width: '20px', height: '20px' }} />
                공유 링크 생성
                {lzStringLoaded && <span style={{ fontSize: '12px', opacity: 0.8 }}>🗜️</span>}
              </button>
              
              {/* 압축 라이브러리 상태 표시 */}
              <div style={{
                fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '8px'
              }}>
                {lzStringLoaded ? (
                  <span style={{ color: '#10b981' }}>✅ 고급 압축 활성화됨</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>⏳ 압축 라이브러리 로딩 중...</span>
                )}
              </div>
            </div>

            {/* 공유 링크 패널 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {shareableUrl && (
                <div style={{
                  background: 'white', padding: '24px', borderRadius: '12px',
                  border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    공유 링크
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text" value={shareableUrl} readOnly
                      style={{
                        flex: 1, padding: '12px', border: '1px solid #e5e7eb',
                        borderRadius: '8px', background: '#f9fafb', fontSize: '14px',
                        fontFamily: 'Monaco, Consolas, monospace', color: '#374151'
                      }}
                    />
                    <button
                      onClick={copyToClipboard}
                      style={{
                        padding: '12px 16px', borderRadius: '8px', border: 'none',
                        fontWeight: '600', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        ...(copySuccess 
                          ? { background: '#10b981', color: 'white' }
                          : { background: '#111827', color: 'white' }
                        )
                      }}
                    >
                      <Copy style={{ width: '16px', height: '16px' }} />
                      {copySuccess ? '복사됨!' : '복사'}
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px', margin: '12px 0 0 0' }}>
                    이 링크를 공유하면 다른 사람들이 같은 스키마를 볼 수 있습니다.
                  </p>
                  {compressionStats && (
                    <div style={{
                      marginTop: '12px', padding: '8px 12px', background: '#f0f9ff',
                      border: '1px solid #0ea5e9', borderRadius: '6px', fontSize: '12px', color: '#0369a1'
                    }}>
                      🗜️ {compressionStats}
                    </div>
                  )}
                </div>
              )}

              <div style={{
                background: 'white', padding: '24px', borderRadius: '12px',
                border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  사용법
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    'OpenAPI 3.0 JSON 스키마를 입력하세요',
                    '"공유 링크 생성" 버튼을 클릭하세요 (자동 압축 적용)', 
                    '생성된 링크를 복사해서 공유하세요',
                    '링크를 받은 사람은 같은 스키마를 볼 수 있습니다'
                  ].map((text, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ 
                        color: '#111827', fontWeight: 'bold', background: '#f3f4f6',
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ color: '#374151', lineHeight: '24px' }}>{text}</span>
                    </div>
                  ))}
                </div>
                
                {/* 압축 기능 안내 */}
                <div style={{
                  marginTop: '16px', padding: '12px', background: '#f0f9ff',
                  border: '1px solid #0ea5e9', borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', marginBottom: '4px' }}>
                    🗜️ 스마트 압축 기능
                  </div>
                  <div style={{ fontSize: '11px', color: '#0369a1', lineHeight: '1.4' }}>
                    • LZ 압축으로 50-80% 크기 감소<br/>
                    • 큰 스키마도 URL로 공유 가능<br/>
                    • 자동으로 최적 압축 방식 선택
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div style={{
            background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
          }}>
            <div style={{ background: '#f9fafb', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Eye style={{ width: '24px', height: '24px', color: '#374151' }} />
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#111827' }}>
                    API 문서 미리보기
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    실제 Swagger UI로 렌더링된 API 문서
                  </p>
                </div>
              </div>
            </div>
            <div style={{ background: 'white' }}>
              {renderSwaggerUI()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwaggerEditor;