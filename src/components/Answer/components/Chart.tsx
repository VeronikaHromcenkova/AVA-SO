import { Stack } from '@fluentui/react';

import styles from '../Answer.module.css';

interface GeneratedChartProps {
  generated_chart?: string | null;
}

const GeneratedChart = ({ generated_chart }: GeneratedChartProps) => {
  if (!generated_chart) return null;

  return (
    <Stack className={styles.answerContainer}>
      <Stack.Item grow>
        <img src={`data:image/png;base64, ${generated_chart}`} alt="Chart" />
      </Stack.Item>
    </Stack>
  );
};

export default GeneratedChart;
