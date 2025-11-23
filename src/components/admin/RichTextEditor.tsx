'use client';

import { useEffect, useRef, useState } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { FreeContent } from '@/types';

interface RichTextEditorProps {
  initialData?: string; // HTML 문자열
  onChange: (html: string) => void;
  placeholder?: string;
}

// EditorJS 데이터를 HTML로 변환
function editorDataToHTML(data: FreeContent): string {
  if (!data || !data.blocks) {
    return '';
  }

  return data.blocks.map(block => {
    const { type, data: blockData } = block;
    
    switch (type) {
      case 'paragraph':
        return `<p class="mb-4 leading-relaxed">${blockData?.text || ''}</p>`;
      
      case 'header':
        const level = Math.min(Math.max(blockData?.level || 2, 1), 6);
        return `<h${level} class="font-bold mb-4 mt-6">${blockData?.text || ''}</h${level}>`;
      
      case 'list':
        const items = (blockData?.items as string[]) || [];
        const style = blockData?.style === 'ordered' ? 'ol' : 'ul';
        const listItems = items.map((item: string) => `<li>${item}</li>`).join('');
        return `<${style}>${listItems}</${style}>`;
      
      case 'checklist':
        const checklistItems = (blockData?.items as Array<{ text: string; checked: boolean }>) || [];
        const checklistHTML = checklistItems.map((item: { text: string; checked: boolean }) => 
          `<li><input type="checkbox" ${item.checked ? 'checked' : ''} disabled> ${item.text}</li>`
        ).join('');
        return `<ul class="checklist">${checklistHTML}</ul>`;
      
      case 'quote':
        return `<blockquote>${blockData?.text || ''}</blockquote>`;
      
      case 'table':
        const content = (blockData?.content as string[][]) || [];
        const rows = content.map((row: string[]) => 
          `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
        ).join('');
        return `<table><tbody>${rows}</tbody></table>`;
      
      case 'image':
        const imageData = blockData as { file?: { url?: string }; url?: string; caption?: string };
        const url = imageData?.file?.url || imageData?.url || '';
        const caption = imageData?.caption || '';
        if (caption) {
          return `<figure class="my-6"><img src="${url}" alt="${caption}" class="w-full h-auto rounded-lg shadow-md" /><figcaption class="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">${caption}</figcaption></figure>`;
        }
        return `<figure class="my-6"><img src="${url}" alt="" class="w-full h-auto rounded-lg shadow-md" /></figure>`;
      
      case 'toggle':
        const toggleTitle = blockData?.title || '';
        const toggleContent = blockData?.content ? editorDataToHTML(blockData.content as FreeContent) : '';
        return `<details><summary>${toggleTitle}</summary>${toggleContent}</details>`;
      
      default:
        return '';
    }
  }).join('\n');
}

// HTML을 EditorJS 데이터로 변환 (간단한 버전)
function htmlToEditorData(html: string): FreeContent {
  if (!html || html.trim() === '') {
    return {
      time: Date.now(),
      blocks: [],
    };
  }

  // 간단한 HTML 파싱 (실제로는 더 정교한 파서가 필요할 수 있음)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: Array<{ type: string; data: Record<string, unknown> }> = [];

  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          blocks.push({
            type: 'paragraph',
            data: { text: element.textContent || '' },
          });
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const level = parseInt(tagName.charAt(1));
          blocks.push({
            type: 'header',
            data: { text: element.textContent || '', level },
          });
          break;
        case 'ul':
        case 'ol':
          const items: string[] = [];
          element.querySelectorAll('li').forEach(li => {
            items.push(li.textContent || '');
          });
          blocks.push({
            type: 'list',
            data: { style: tagName === 'ol' ? 'ordered' : 'unordered', items },
          });
          break;
        case 'blockquote':
          blocks.push({
            type: 'quote',
            data: { text: element.textContent || '' },
          });
          break;
        case 'img':
          const img = element as HTMLImageElement;
          blocks.push({
            type: 'image',
            data: { url: img.src, caption: img.alt || '' },
          });
          break;
      }
    }
  });

  return {
    time: Date.now(),
    blocks: blocks.length > 0 ? blocks : [{ type: 'paragraph', data: { text: '' } }],
  };
}

export function RichTextEditor({ initialData = '', onChange, placeholder = '내용을 입력하세요...' }: RichTextEditorProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let editorInstance: EditorJS | null = null;

    async function createEditor() {
      // 기존 에디터가 있으면 먼저 정리
      if (editorRef.current) {
        console.log('RichTextEditor: Cleaning up existing editor...');
        try {
          await editorRef.current.destroy();
        } catch (e) {
          console.error('Error destroying existing editor:', e);
        }
        editorRef.current = null;
      }

      if (!holderRef.current) {
        console.error('RichTextEditor: holderRef.current is null');
        if (isMounted) {
          setLoading(false);
          setError('에디터 컨테이너를 찾을 수 없습니다.');
        }
        return;
      }

      setLoading(true);
      setError(null);
      holderRef.current.innerHTML = '';

      try {
        console.log('RichTextEditor: Starting to load modules...');
        const [
          { default: EditorJSModule },
          { default: Paragraph },
          { default: Header },
          { default: List },
          { default: Checklist },
          { default: Table },
          { default: ImageTool },
          { default: Quote },
          { default: TextColorTool },
          { default: ToggleBlock },
          { default: DragDrop },
        ] = await Promise.all([
          import('@editorjs/editorjs'),
          import('@editorjs/paragraph'),
          import('@editorjs/header'),
          import('@editorjs/list'),
          import('@editorjs/checklist'),
          import('@editorjs/table'),
          import('@editorjs/image'),
          import('@editorjs/quote'),
          import('@/lib/editor/TextColorTool'),
          import('editorjs-toggle-block'),
          import('editorjs-drag-drop'),
        ]);

        if (!isMounted || !holderRef.current) {
          console.log('RichTextEditor: Component unmounted or holder not available');
          return;
        }

        // 중복 초기화 방지
        if (editorRef.current) {
          console.log('RichTextEditor: Editor already exists, skipping...');
          return;
        }

        console.log('RichTextEditor: Modules loaded, creating editor...');

        // HTML을 EditorJS 데이터로 변환
        const initialEditorData = htmlToEditorData(initialData);
        console.log('RichTextEditor: Initial editor data:', initialEditorData);

        editorInstance = new EditorJSModule({
          holder: holderRef.current,
          autofocus: false,
          minHeight: 300,
          placeholder,
          data: initialEditorData,
          defaultBlock: 'paragraph',
          readOnly: false,
          i18n: {
            messages: {
              ui: {
                blockTunes: {
                  toggler: {
                    "Click to tune": '설정 열기',
                    "or drag to move": '또는 드래그하여 이동',
                  },
                  delete: '삭제',
                  moveUp: '위로 이동',
                  moveDown: '아래로 이동',
                },
                toolbar: {
                  toolbox: '블록 추가',
                  settings: '설정',
                  close: '닫기',
                },
                popover: {
                  Filter: '검색',
                  Back: '뒤로',
                  "Nothing found": '검색 결과가 없습니다',
                  "Create": '생성',
                },
              },
              toolNames: {
                Text: '본문',
                Paragraph: '본문',
                Header: '제목',
                List: '리스트',
                Checklist: '체크리스트',
                Table: '표',
                Quote: '인용구',
                Image: '이미지',
                Delimiter: '구분선',
                Toggle: '토글',
                textColor: '글자색',
              },
              tools: {
                header: {
                  "Heading 1": '제목 1 (가장 큰 제목)',
                  "Heading 2": '제목 2 (큰 제목)',
                  "Heading 3": '제목 3 (중간 제목)',
                  "Heading 4": '제목 4 (작은 제목)',
                  "Heading 5": '제목 5 (더 작은 제목)',
                  "Heading 6": '제목 6 (가장 작은 제목)',
                },
                list: {
                  Ordered: '번호 목록',
                  Unordered: '글머리 기호',
                },
                checklist: {
                  Add: '항목 추가',
                },
                table: {
                  "Add column": '열 추가',
                  "Add row": '행 추가',
                },
                toggle: {
                  Title: '제목',
                  Content: '내용',
                },
                image: {
                  "Select an Image": '이미지 선택',
                  "With file": '파일로 업로드',
                  "With URL": 'URL로 가져오기',
                  "Couldn't upload image. Please try another.": '이미지 업로드에 실패했습니다. 다른 이미지를 시도해주세요.',
                },
              },
            },
          },
          tools: {
            paragraph: {
              class: Paragraph,
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
            },
            header: {
              class: Header,
              config: {
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
                placeholder: '제목을 입력하세요',
              },
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
            },
            list: {
              class: List,
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
            },
            checklist: {
              class: Checklist,
              inlineToolbar: ['bold', 'italic', 'textColor'],
            },
            table: {
              class: Table,
              inlineToolbar: ['bold', 'italic', 'textColor'],
              config: {
                rows: 2,
                cols: 2,
              },
            },
            image: {
              class: ImageTool,
              config: {
                captionPlaceholder: '이미지 설명을 입력하세요 (선택사항)',
                buttonContent: '📷 이미지 삽입',
                uploader: {
                  async uploadByFile(file: File) {
                    // 파일 크기 제한 (10MB)
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                      throw new Error('이미지 크기는 10MB 이하여야 합니다.');
                    }

                    if (!file.type.startsWith('image/')) {
                      throw new Error('이미지 파일만 업로드할 수 있습니다.');
                    }
                    
                    // Base64로 변환하여 저장 (실제 프로덕션에서는 서버에 업로드하는 것이 좋습니다)
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const url = e.target?.result as string;
                        resolve({
                          success: 1,
                          file: {
                            url: url,
                          },
                        });
                      };
                      reader.onerror = () => {
                        reject(new Error('파일 읽기에 실패했습니다.'));
                      };
                      reader.readAsDataURL(file);
                    });
                  },
                  async uploadByUrl(url: string) {
                    // URL 유효성 검사
                    try {
                      new URL(url);
                    } catch {
                      throw new Error('유효한 이미지 URL을 입력해주세요.');
                    }

                    // URL로 이미지 가져오기
                    return {
                      success: 1,
                      file: {
                        url: url,
                      },
                    };
                  },
                },
                endpoints: {
                  byFile: '', // 파일 업로드는 uploader에서 처리
                  byUrl: '', // URL은 uploader에서 처리
                },
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
              shortcut: 'CMD+SHIFT+O',
              config: {
                quotePlaceholder: '인용구를 입력하세요',
                captionPlaceholder: '출처를 입력하세요',
              },
            },
            textColor: {
              class: TextColorTool,
              config: {
                colors: ['#111827', '#4b5563', '#ef4444', '#f97316', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#facc15'],
                defaultColor: '#111827',
              },
            },
            toggle: {
              class: ToggleBlock,
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
            },
          },
          onChange: async () => {
            if (!editorRef.current) {
              return;
            }

            try {
              const data = (await editorRef.current.save()) as FreeContent;
              const html = editorDataToHTML(data);
              onChange(html);
            } catch (error) {
              console.error('Error saving editor data:', error);
            }
          },
        });

        if (!isMounted || !holderRef.current) {
          console.log('RichTextEditor: Component unmounted before editor ready');
          if (editorInstance) {
            try {
              await editorInstance.destroy();
            } catch (e) {
              console.error('Error destroying editor after unmount:', e);
            }
          }
          return;
        }

        editorRef.current = editorInstance;

        console.log('RichTextEditor: Waiting for editor to be ready...');
        await editorInstance.isReady;
        console.log('RichTextEditor: Editor is ready!');

        if (isMounted && editorRef.current === editorInstance) {
          setLoading(false);
          try {
            new DragDrop(editorInstance);
          } catch (e) {
            console.error('Error initializing DragDrop:', e);
          }
        }
      } catch (error) {
        console.error('RichTextEditor: Failed to initialize editor:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('RichTextEditor: Error details:', {
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        if (isMounted) {
          setLoading(false);
          setError(`에디터 초기화 실패: ${errorMessage}`);
        }
      }
    }

    createEditor();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.error('Error destroying editor on cleanup:', e);
        }
        editorRef.current = null;
      }
    };
  }, [initialData, placeholder]);

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 min-h-[300px] relative">
      {/* holderRef는 항상 렌더링되어야 함 */}
      <div 
        ref={holderRef} 
        className="prose prose-sm dark:prose-invert max-w-none"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">에디터를 불러오는 중...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">잠시만 기다려주세요</p>
          </div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">브라우저 콘솔을 확인해주세요</p>
          </div>
        </div>
      )}
    </div>
  );
}

