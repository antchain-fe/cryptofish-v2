import * as React from 'react';
import { Button, Empty, Space } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { history, useRequest } from 'umi';
import confetti from 'canvas-confetti';
import { ICollection } from '@/components/CollectionsCard';
import { useAntChain } from '@/hooks/useAntChain';
import Collection from '@/components/Collection';
import { message } from 'antd';

const MintPage: React.FC<unknown> = () => {
  const { contract, isConnected } = useAntChain();

  React.useEffect(() => {
    if (!isConnected) history.replace('/');
  }, [isConnected]);

  const { loading: mintLoading, run: mint, data } = useRequest(
    async () => {
      const { returnValue } = await contract!.call<string>({
        methodName: 'mint',
      });
      return { data: JSON.parse(returnValue) as ICollection | null };
    },
    {
      manual: true,
      onError: (err) => message.error(err.message),
    },
  );

  return (
    <div style={{
      padding: 32,
    }}>
      {
        data ? (
          <div>
            <Collection collection={data} />
            <Space>
              <Button shape="round" onClick={() => history.push('/')}>
                返回首页
              </Button>
              <Button shape="round" onClick={() => history.push('/collections')}>
                查看全部
              </Button>
            </Space>
          </div>
        ) : (
          <Empty
            description="铸造一个新的加密鱼">
            <Button
              loading={mintLoading}
              type="primary"
              size="large"
              shape="round"
              icon={<ThunderboltOutlined />}
              onClick={async () => {
                await mint();
                confetti();
              }}
            >
              铸造
            </Button>
          </Empty>
        )
      }
    </div>
  );
};

export default MintPage;
