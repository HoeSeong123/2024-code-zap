import { type LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs';
import { materialLight } from '@uiw/codemirror-theme-material';
import ReactCodeMirror from '@uiw/react-codemirror';
import { ChangeEvent } from 'react';

import { ToastContext } from '@/contexts';
import { useCustomContext } from '@/hooks/utils';
import { validateFileName } from '@/service/validates';
import { getLanguageByFilename } from '@/utils';
import * as S from './style';

interface Props {
  index: number;
  fileName: string;
  content: string;
  onChangeContent: (newContent: string) => void;
  onChangeFileName: (newFileName: string) => void;
}

const SourceCodeEditor = ({ index, fileName, content, onChangeContent, onChangeFileName }: Props) => {
  const { failAlert } = useCustomContext(ToastContext);

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeFileName(event.target.value);
  };

  const handleContentChange = (value: string) => {
    onChangeContent(value);
  };

  const handleValidateFileName = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    if (validateFileName(event.target.value)) {
      failAlert(validateFileName(event.target.value));
    }
  };

  return (
    <S.SourceCodeEditorContainer>
      <S.SourceCodeFileNameInput
        value={fileName}
        onChange={handleFileNameChange}
        onBlur={handleValidateFileName}
        placeholder={'파일명.js'}
        autoFocus={index !== 0 ? true : false}
      />
      <ReactCodeMirror
        placeholder={'// 코드를 입력해주세요'}
        value={content}
        height='100%'
        minHeight='10rem'
        maxHeight='40rem'
        style={{ width: '100%' }}
        theme={materialLight}
        onChange={handleContentChange}
        extensions={[loadLanguage(getLanguageByFilename(fileName) as LanguageName) || []]}
      />
    </S.SourceCodeEditorContainer>
  );
};

export default SourceCodeEditor;
