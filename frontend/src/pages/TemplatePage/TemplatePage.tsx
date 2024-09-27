import { useTheme } from '@emotion/react';
import { type LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs';
import { quietlight } from '@uiw/codemirror-theme-quietlight';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { useParams } from 'react-router-dom';

import { ChevronIcon, ClockIcon, PersonIcon } from '@/assets/images';
import { Button, Flex, Heading, LikeButton, Modal, SelectList, TagButton, Text, NonmemberAlerter } from '@/components';
import { ToastContext } from '@/contexts';
import { useCustomContext, useToggle } from '@/hooks';
import { useAuth } from '@/hooks/authentication';
import { TemplateEditPage } from '@/pages';
import type { SourceCodes } from '@/types';
import { formatRelativeTime, getLanguageByFilename } from '@/utils';

import { useTemplate } from './hooks';
import { useLike } from './hooks/useLike';
import * as S from './TemplatePage.style';

const TemplatePage = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const [isNonmemberAlerterOpen, toggleNonmemberAlerter] = useToggle();

  const {
    isLogin,
    memberInfo: { name },
  } = useAuth();

  const { infoAlert } = useCustomContext(ToastContext);
  const [isOpen, toggleModal] = useToggle();

  const copyCode = (sourceCode: SourceCodes) => () => {
    navigator.clipboard.writeText(sourceCode.content);
    infoAlert('코드가 복사되었습니다!');
  };

  const {
    currentFile,
    template,
    isEdit,
    sourceCodeRefs,
    toggleEditButton,
    handleEditButtonClick,
    handleSelectOption,
    handleDelete,
    isOpenList,
    handleIsOpenList,
  } = useTemplate(Number(id));

  const { likesCount, isLiked, toggleLike } = useLike({
    templateId: Number(id),
    initialLikesCount: template?.likesCount || 0,
    initialIsLiked: template?.isLiked || false,
  });

  const handleLikeButtonClick = () => {
    if (!isLogin) {
      toggleNonmemberAlerter();

      return;
    }

    toggleLike();
  };

  if (!template) {
    return <div>템플릿을 불러오는 중...</div>;
  }

  return (
    <>
      {isEdit ? (
        <TemplateEditPage template={template} toggleEditButton={toggleEditButton} />
      ) : (
        <Flex justify='space-between' align='center' width='100%'>
          <S.MainContainer>
            <Flex
              justify='space-between'
              gap='1rem'
              width='100%'
              css={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 'normal',
              }}
            >
              <Flex direction='column' gap='0.75rem' width='100%'>
                <Flex justify='space-between'>
                  <Text.Medium color={theme.color.dark.secondary_500}>{template.category?.name}</Text.Medium>
                  {template.member.name === name && (
                    <Flex width='5.5rem' justify='space-around'>
                      <S.EditButton
                        size='small'
                        variant='text'
                        onClick={() => {
                          handleEditButtonClick();
                        }}
                        style={{ width: '2rem' }}
                      >
                        <Text.Small color={theme.color.light.secondary_700}>편집</Text.Small>
                      </S.EditButton>
                      <S.DeleteButton size='small' variant='text' onClick={toggleModal} style={{ width: '2rem' }}>
                        <Text.Small color={theme.color.light.secondary_700}>삭제</Text.Small>
                      </S.DeleteButton>
                    </Flex>
                  )}
                </Flex>

                <Flex align='center' justify='space-between' gap='1rem'>
                  <Heading.Large color={theme.mode === 'dark' ? theme.color.dark.white : theme.color.light.black}>
                    {template.title}
                  </Heading.Large>
                  <LikeButton likesCount={likesCount} isLiked={isLiked} onLikeButtonClick={handleLikeButtonClick} />
                </Flex>

                <Flex gap='0.5rem' align='center'>
                  <Flex align='center' gap='0.125rem' style={{ minWidth: 0, flex: '1' }}>
                    <PersonIcon width={14} />
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      <Text.Small
                        color={theme.mode === 'dark' ? theme.color.dark.primary_300 : theme.color.light.primary_500}
                      >
                        {template.member.name}
                      </Text.Small>
                    </div>
                  </Flex>
                  <Flex align='center' gap='0.125rem'>
                    <ClockIcon width={16} />
                    <Text.Small
                      color={theme.mode === 'dark' ? theme.color.dark.primary_300 : theme.color.light.primary_500}
                    >
                      {formatRelativeTime(template.modifiedAt)}
                    </Text.Small>
                    <Text.Small
                      color={theme.mode === 'dark' ? theme.color.dark.secondary_300 : theme.color.light.secondary_400}
                    >
                      ({formatRelativeTime(template.createdAt)})
                    </Text.Small>
                  </Flex>
                </Flex>

                <Flex gap='0.25rem' wrap='wrap'>
                  {template.tags.map((tag) => (
                    <TagButton key={tag.id} name={tag.name} disabled></TagButton>
                  ))}
                </Flex>
                <div
                  css={{
                    width: '100%',
                    borderTop: `1px solid ${theme.color.light.secondary_100}`,
                    margin: '0.5rem 0rem',
                  }}
                ></div>
                <Text.Medium color={theme.color.dark.secondary_600}>{template.description}</Text.Medium>
              </Flex>
            </Flex>

            {isOpen && (
              <Modal isOpen={isOpen} toggleModal={toggleModal} size='xsmall'>
                <Flex direction='column' justify='space-between' align='center' margin='1rem 0 0 0' gap='2rem'>
                  <Flex direction='column' justify='center' align='center' gap='0.75rem'>
                    <Text.Large color='black' weight='bold'>
                      정말 삭제하시겠습니까?
                    </Text.Large>
                    <Text.Medium color='black'>삭제된 템플릿은 복구할 수 없습니다.</Text.Medium>
                  </Flex>
                  <Flex justify='center' align='center' gap='0.5rem'>
                    <Button variant='outlined' onClick={toggleModal}>
                      취소
                    </Button>
                    <Button onClick={handleDelete}>삭제</Button>
                  </Flex>
                </Flex>
              </Modal>
            )}

            {template.sourceCodes.map((sourceCode, index) => (
              <div
                id={sourceCode.filename}
                key={sourceCode.id}
                ref={(el) => (sourceCodeRefs.current[index] = el)}
                css={{ width: '100%' }}
              >
                <Flex
                  justify='space-between'
                  align='center'
                  height='3rem'
                  padding='1rem 1.5rem'
                  width='100%'
                  style={{ background: `${theme.color.light.tertiary_600}`, borderRadius: '8px 8px 0 0' }}
                >
                  <Flex
                    justify='space-between'
                    align='center'
                    gap='0.5rem'
                    onClick={handleIsOpenList(index)}
                    css={{
                      cursor: 'pointer',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <ChevronIcon
                      width={16}
                      height={16}
                      aria-label='소스코드 펼침'
                      css={{
                        transition: 'transform 0.3s ease',
                        transform: isOpenList[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                    <S.NoScrollbarContainer>
                      <Text.Small color='#fff' weight='bold'>
                        {sourceCode.filename}
                      </Text.Small>
                    </S.NoScrollbarContainer>
                  </Flex>
                  <Button
                    size='small'
                    variant='text'
                    onClick={copyCode(sourceCode)}
                    css={{
                      width: 'auto',
                      padding: '0.25rem 0.5rem',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content',
                    }}
                  >
                    <Text.Small color={theme.color.light.primary_500} weight='bold'>
                      {'복사'}
                    </Text.Small>
                  </Button>
                </Flex>
                <S.SyntaxHighlighterWrapper isOpen={isOpenList[index]}>
                  {isOpenList[index] && (
                    <CodeMirror
                      value={sourceCode.content}
                      height='100%'
                      style={{ width: '100%', fontSize: '1rem' }}
                      theme={quietlight}
                      extensions={[
                        loadLanguage(getLanguageByFilename(sourceCode?.filename) as LanguageName) || [],
                        S.CustomCodeMirrorTheme,
                        EditorView.editable.of(false),
                      ]}
                      css={{
                        '.cm-editor': {
                          borderRadius: '0 0 8px 8px',
                          overflow: 'hidden',
                        },
                        '.cm-scroller': {
                          padding: '1rem 0',
                          overflowY: 'auto',
                          height: '100%',
                        },
                      }}
                    />
                  )}
                </S.SyntaxHighlighterWrapper>
              </div>
            ))}
          </S.MainContainer>

          <S.SidebarContainer>
            <SelectList>
              {template.sourceCodes.map((sourceCode, index) => (
                <SelectList.Option
                  key={sourceCode.id}
                  onClick={handleSelectOption(index)}
                  isSelected={currentFile === sourceCode.id}
                >
                  {sourceCode.filename}
                </SelectList.Option>
              ))}
            </SelectList>
          </S.SidebarContainer>
        </Flex>
      )}

      <NonmemberAlerter isOpen={isNonmemberAlerterOpen} toggleModal={toggleNonmemberAlerter} />
    </>
  );
};

export default TemplatePage;
