import * as React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { GithubOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Connector } from '@/components/Connector';
import { Logo } from './components';
import styled from 'styled-components';
import { history } from 'umi';
import { useAntChain } from '@/hooks/useAntChain';

const FullSpace = styled(Space)`
  width: 100%;
  height: 100%;
  justify-content: center;
`;

const MainCard = styled(Card)`
  width: 500px;
`;

const HomePage: React.FC<unknown> = () => {
  const { isConnected } = useAntChain();

  return (
    <FullSpace align="center">
      <Space size="large" align="start" style={{ margin: '30px 0' }}>
        <Logo />
        <Space size="large" direction="vertical">
          <MainCard bordered={false}>
            <Typography>
              <Typography.Title>Myfish 加密鱼</Typography.Title>
              <Typography.Paragraph>
                Myfish 加密鱼（CryptoFish）是通过 <a href="https://opendocs.antchain.antgroup.com/myfish">Myfish</a>{' '}
                工具链开发、运行在<a href="https://antchain.antgroup.com/">蚂蚁链</a>实验链上的一款分布式应用（DApp）。
              </Typography.Paragraph>
            </Typography>
            <Space>
              {isConnected ? (
                <>
                  <Button
                    shape="round"
                    type="primary"
                    onClick={() => history.push('/mint')}
                    icon={<ThunderboltOutlined />}
                  >
                    去铸造
                  </Button>
                  <Button shape="round" type="primary" onClick={() => history.push('/collections')}>
                    查看全部
                  </Button>
                </>
              ) : (
                <Connector />
              )}
              <Button
                icon={<GithubOutlined />}
                shape="round"
                href="https://github.com/antchain-fe/cryptofish-v2/blob/main/contract/assembly/index.ts"
                target="_blank"
              >
                智能合约
              </Button>
            </Space>
          </MainCard>
          <MainCard bordered={false}>
            <Typography>
              <Typography.Paragraph>
                每个人都可以通过调用智能合约接口生成一条独一无二的鱼，生成的逻辑通过智能合约实现，通过区块链执行保证公开透明。
              </Typography.Paragraph>
              <Typography.Paragraph>
                这是一个实验性质的项目，智能合约部署在提供给开发者实验用的实验链上，仅供学习交流使用。你可以使用生成的 CryptoFish 用于自己的实验项目或者头像，但不能用于商业用途。
              </Typography.Paragraph>
            </Typography>
          </MainCard>
        </Space>
      </Space>
    </FullSpace>
  );
};
export default HomePage;
