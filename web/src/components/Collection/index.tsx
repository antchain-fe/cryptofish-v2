import * as React from 'react';
import { Row, Col, Card, Tooltip, Button } from 'antd';
import { ICollection } from '@/components/CollectionsCard';
import { Canvas, ICanvasRef } from '@/components/Canvas';
import { string2Attribute, cache } from '@/common/attribute';
import { formatAddress } from '@/common/utils';
import styled from 'styled-components';

const DownloadLink = styled.div`
  text-align: center;
`;

const CollectionDetailPage: React.FC<{ collection: ICollection }> = ({ collection }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const canvasRef = React.useRef<ICanvasRef>(null);
  const attribute = string2Attribute(collection?.attribute);

  React.useEffect(() => {
    if (attribute) {
      Promise.all(
        // @ts-ignore
        ['skin', 'background', 'frame', 'fin', 'eye', 'tail'].map((attr) => cache?.[`${attr}_${attribute[attr]}`]),
      ).then((images) => setImages(images.map(({ default: url }) => url)));
    }
  }, [!!attribute]);

  return (
    <Row gutter={16} style={{ padding: '40px 0', width: 900 }}>
      <Col span={8}>
        <Canvas attribute={attribute!} ratio={8} ref={canvasRef} />
        <DownloadLink>
          <Button
            type="link"
            onClick={() => {
              const a = document.createElement('a');
              a.href = canvasRef.current?.toDataURL()!;
              a.download = `cryptofish_${collection?.index}.png`;
              a.click();
            }}
          >
            下载图片
          </Button>
        </DownloadLink>
      </Col>
      <Col span={16}>
        <Card title={`CryptoFish #${collection?.index}`}>
          <p>特征值: {collection?.attribute}</p>
          <p>
            铸造者: <Tooltip title={collection?.creator}>{formatAddress(collection!.creator)}</Tooltip>
          </p>
        </Card>
        <Card title={`Attributes #${collection?.attribute}`} style={{ marginTop: 16 }}>
          {images.map((url) => (
            <Card.Grid
              key={url}
              style={{
                width: `${100 / images.length}%`,
                textAlign: 'center',
              }}
            >
              <img src={url} alt={url} />
            </Card.Grid>
          ))}
        </Card>
      </Col>
    </Row>
  );
};
export default CollectionDetailPage;
