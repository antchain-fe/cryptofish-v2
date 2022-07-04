import * as React from 'react';
import { Row, Col, Skeleton } from 'antd';
import { useRequest, useParams } from 'umi';
import { ICollection } from '@/components/CollectionsCard';
import { useAntChain } from '@/hooks/useAntChain';
import { message } from 'antd';
import { string2Attribute, cache } from '@/common/attribute';
import { Connector } from '@/components/Connector';
import Collection from '@/components/Collection';

const CollectionDetailPage: React.FC<unknown> = () => {
  const { id } = useParams<{ id: string }>();

  const index = React.useMemo(() => Number(id), [id]);
  const { contract, isConnected } = useAntChain();

  const { loading, data: collection } = useRequest(
    async () => {
      const { returnValue } = await contract!.call<string>({
        methodName: 'getCollectionByIndex',
        args: [index],
      });
      return { data: JSON.parse(returnValue) as ICollection };
    },
    {
      ready: !!contract,
      onError: (err) => message.error(err.message),
    },
  );

  const attribute = string2Attribute(collection?.attribute);

  if (!isConnected) {
    return (
      <Row gutter={16} style={{ padding: '40px 0', width: 900 }}>
        <Col span={24}>
          查看该 CryptoFish 请先下载连接器并连接链：<Connector />
        </Col>
      </Row>
    )
  }

  if (loading) return <Skeleton avatar paragraph={{ rows: 4 }} style={{ width: 800, padding: '40px 0' }} />;
  if (!loading && !attribute) return <div>error</div>;
  if (!collection) return <div>error</div>;

  return (
    <Collection collection={collection} />
  );
};
export default CollectionDetailPage;
