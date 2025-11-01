'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type EditorJS from '@editorjs/editorjs';
import type { FreeContent } from '@/types';
import { extractPlainTextFromFreeContent, normalizeFreeContent } from '@/lib/utils';

interface FreeTemplateProps {
  initialData?: FreeContent;
  onSave: (data: FreeContent) => void;
  saving?: boolean;
}

export function FreeTemplate({ initialData, onSave, saving = false }: FreeTemplateProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const latestDataRef = useRef<FreeContent | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(true);
  const [charCount, setCharCount] = useState(0);

  const initialEditorData = useMemo<FreeContent>(() => {
    const normalized = normalizeFreeContent(initialData);

    if (!normalized.blocks.length) {
      return {
        ...normalized,
        blocks: [],
      };
    }

    return normalized;
  }, [initialData]);

  useEffect(() => {
    latestDataRef.current = initialEditorData;
    setCharCount(extractPlainTextFromFreeContent(initialEditorData).length);
  }, [initialEditorData]);

  useEffect(() => {
    let isMounted = true;

    async function createEditor() {
      if (!holderRef.current || editorRef.current) {
        return;
      }

      setLoadingEditor(true);

      // Strict Mode에서 중복 마운트를 대비해 기존 내용을 초기화
      holderRef.current.innerHTML = '';

      try {
        const [
          { default: EditorJSModule },
          { default: Paragraph },
          { default: Header },
          { default: List },
          { default: Checklist },
          { default: Table },
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
          import('@/lib/editor/TextColorTool'),
          import('editorjs-toggle-block'),
          import('editorjs-drag-drop'),
        ]);

        if (!isMounted || !holderRef.current || editorRef.current) {
          return;
        }

        const editor = new EditorJSModule({
          holder: holderRef.current,
          autofocus: true,
          minHeight: 280,
          placeholder: "오늘의 회고를 작성해보세요. / 명령어 사용시에는 '/'를 누르세요.",
          data: initialEditorData,
          defaultBlock: 'paragraph',
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
                Delimiter: '구분선',
                Toggle: '토글',
                textColor: '글자색',
              },
              tools: {
                header: {
                  "Heading 1": '제목 1',
                  "Heading 2": '제목 2',
                  "Heading 3": '제목 3',
                  "Heading 4": '제목 4',
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
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
              config: {
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
                placeholder: '제목을 입력하세요',
              },
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
            },
            toggle: {
              class: ToggleBlock,
              inlineToolbar: ['bold', 'italic', 'link', 'textColor'],
            },
            textColor: {
              class: TextColorTool,
              config: {
                colors: ['#111827', '#4b5563', '#ef4444', '#f97316', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#facc15'],
                defaultColor: '#111827',
              },
            },
          },
          onChange: async () => {
            if (!editorRef.current) {
              return;
            }

            const data = (await editorRef.current.save()) as FreeContent;
            latestDataRef.current = data;

            if (isMounted) {
              setCharCount(extractPlainTextFromFreeContent(data).length);
            }
          },
        });

        editorRef.current = editor;

        await editor.isReady;

        if (!isMounted) {
          return;
        }

        new DragDrop(editor);

        if (isMounted) {
          setLoadingEditor(false);
        }
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        if (isMounted) {
          setLoadingEditor(false);
        }
      }
    }

    createEditor();

    return () => {
      isMounted = false;

      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }

      if (holderRef.current) {
        holderRef.current.innerHTML = '';
      }
    };
  }, [initialEditorData]);

  const handleSave = async () => {
    if (!editorRef.current) {
      return;
    }

    const data = (await editorRef.current.save()) as FreeContent;
    latestDataRef.current = data;
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>자유 작성</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={holderRef}
          className="border rounded-lg px-4 py-6 bg-white shadow-sm"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <span>글자 수: {charCount}</span>
          <Button onClick={handleSave} size="lg" disabled={saving || loadingEditor}>
            {saving ? '저장 중...' : '회고 저장하기'}
          </Button>
        </div>
        {loadingEditor && (
          <p className="text-xs text-gray-400">에디터를 불러오는 중입니다...</p>
        )}
      </CardContent>
    </Card>
  );
}

