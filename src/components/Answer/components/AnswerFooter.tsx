import { useEffect, useState } from 'react';
import { FontIcon, Stack, Text } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

import { Citation, ExecResults } from '../../../api';
import { createCitationFilepath } from '../../../utils/answerCitations';

import styles from '../Answer.module.css';

interface ReferenceToggleProps {
  citations?: Citation[];
  exec_results?: ExecResults[];
  onExectResultClicked: () => void;
  onCitationClicked: (citedDocument: Citation) => void;
}

const AnswerFooter = ({ citations, exec_results, onExectResultClicked, onCitationClicked }: ReferenceToggleProps) => {
  const [isRefAccordionOpen, { toggle: toggleIsRefAccordionOpen }] = useBoolean(false);
  const [chevronIsExpanded, setChevronIsExpanded] = useState(isRefAccordionOpen);

  const handleChevronClick = () => {
    setChevronIsExpanded(!chevronIsExpanded);
    toggleIsRefAccordionOpen();
  };

  useEffect(() => {
    setChevronIsExpanded(isRefAccordionOpen);
  }, [isRefAccordionOpen]);

  return (
    <>
      <Stack horizontal className={styles.answerFooter}>
        {!!citations?.length && (
          <Stack.Item onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? toggleIsRefAccordionOpen() : null)}>
            <Stack style={{ width: '100%' }}>
              <Stack horizontal horizontalAlign="start" verticalAlign="center">
                <Text
                  className={styles.accordionTitle}
                  onClick={toggleIsRefAccordionOpen}
                  aria-label="Open references"
                  tabIndex={0}
                  role="button">
                  <span>{citations.length > 1 ? citations.length + ' references' : '1 reference'}</span>
                </Text>
                <FontIcon
                  className={styles.accordionIcon}
                  onClick={handleChevronClick}
                  iconName={chevronIsExpanded ? 'ChevronDown' : 'ChevronRight'}
                />
              </Stack>
            </Stack>
          </Stack.Item>
        )}

        <Stack.Item className={styles.answerDisclaimerContainer}>
          <span className={styles.answerDisclaimer}>AI-generated content may be incorrect</span>
        </Stack.Item>

        {!!exec_results?.length && (
          <Stack.Item onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? toggleIsRefAccordionOpen() : null)}>
            <Stack style={{ width: '100%' }}>
              <Stack horizontal horizontalAlign="start" verticalAlign="center">
                <Text
                  className={styles.accordionTitle}
                  onClick={onExectResultClicked}
                  aria-label="Open Intents"
                  tabIndex={0}
                  role="button">
                  <span>Show Intents</span>
                </Text>
                <FontIcon className={styles.accordionIcon} onClick={handleChevronClick} iconName={'ChevronRight'} />
              </Stack>
            </Stack>
          </Stack.Item>
        )}
      </Stack>

      {chevronIsExpanded && (
        <div className={styles.citationWrapper}>
          {citations?.map((citation, idx) => {
            return (
              <span
                title={createCitationFilepath(citation, ++idx)}
                tabIndex={0}
                role="link"
                key={idx}
                onClick={() => onCitationClicked(citation)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ? onCitationClicked(citation) : null)}
                className={styles.citationContainer}
                aria-label={createCitationFilepath(citation, idx)}>
                <div className={styles.citation}>{idx}</div>
                {createCitationFilepath(citation, idx, true)}
              </span>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AnswerFooter;
