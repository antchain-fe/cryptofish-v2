import { my, Storage, BaseContract } from '@antchain/myassembly';
import { Address, Attribute, AttributeType, Collection } from './types';
import { parseHex2Int, stringifyCollection, stringifyCollections, parseInt2Hex } from './utils';

export default class CryptoFishContract extends BaseContract {
  // You can use this hash to verify the rule image file containing all the fish's attributes
  // $ md5 ./assets/rule.png => ada24c6d6d4d403374c81995cceb7262
  public ruleHash: string = 'ada24c6d6d4d403374c81995cceb7262';
  // CryptoFish standard name
  public standard: string = 'CryptoFish';

  // Collection count limit per address
  private limit: u32;
  // Mint available, depend on developer
  private canMint: Storage<bool> = new Storage('canMint', true);
  // CryptoFish contract owner's address
  private owner: Storage<Address> = new Storage('owner', '');
  // Collections list
  private collections: Storage<Collection[]> = new Storage('collections', []);
  private collectionAttributeMap: Storage<Map<Attribute, bool>> = new Storage(
    'collectionAttributeMap',
    new Map<Attribute, bool>(),
  );

  // Private builtin attributes infos
  // attribute key list depends on rule hash
  private attributeKeyList: AttributeType[] = ['skin', 'background', 'frame', 'fin', 'eye', 'tail'];
  private attributeWeights: Map<AttributeType, u32> = new Map<AttributeType, u32>();
  private attributes: Map<AttributeType, string> = new Map<AttributeType, string>();

  constructor() {
    super();

    this.limit = 99999;

    // prepare attribute weights
    // `skin/background/frame` has different weights than others when calculating score
    this.attributeWeights.set('skin', 330);
    this.attributeWeights.set('background', 220);
    this.attributeWeights.set('frame', 220);
    this.attributeWeights.set('fin', 110);
    this.attributeWeights.set('eye', 100);
    this.attributeWeights.set('tail', 100);

    // prepare attributes
    this.attributes.set('skin', '0123456789');
    this.attributes.set('background', '0123456789AB');
    this.attributes.set('frame', '0123456789AB');
    this.attributes.set('fin', '0123456789');
    this.attributes.set('eye', '0123456789');
    this.attributes.set('tail', '0123456789');
  }

  // onDeploy callback, only for developers
  @EXPORT
  public onContractDeploy(): void {
    // Prepare contract when deploy contract
    if (this.owner.getData().length > 0) {
      throw new Error('[cryptofish] cannot run this method');
    }
    // Record the contract developer as owner
    const ownerAddress = my.getSender().toString();
    this.owner.setData(ownerAddress);

    this.log(`contract created by: ${ownerAddress}`);

    this.setCanMint(1);
    // Grant the first(index: 0) collection to our developer.
    this.mint();
  }

  // Mint collection for current address
  @EXPORT
  public mint(): string {
    // current address
    const creator = my.getSender().toString();
    const ownedCount = <u32>this.getOwnedCollectionsPrivate().length;
    const canMint = this.canMint.getData();

    // Limit for each address(see `this.limit`)
    // Developers are not restricted
    if (ownedCount >= this.limit) {
      this.log(`error: you cannot own more than ${this.limit} collections(${creator})`);
      return 'null';
    }

    // Mint available
    // Developers are not restricted
    if (!canMint) {
      this.log(`error: ${this.standard} minting is not available`);
      return 'null';
    }

    // generate unique and available attribute
    const attribute = this.generateUniqAttribute();
    const collections = this.collections.getData();
    const collectionAttributeMap = this.collectionAttributeMap.getData();
    const index = collections.length;

    const collection: Collection = new Map<string, string>();
    collection.set('index', index.toString());
    collection.set('creator', creator);
    collection.set('attribute', attribute);
    collection.set('score', this.calculateScore(attribute).toString());

    this.log('mint collection success:');
    this.printCollection(collection);

    // save to chain
    collections.push(collection);
    this.collections.setData(collections);
    // mark attribute
    collectionAttributeMap.set(attribute, true);
    this.collectionAttributeMap.setData(collectionAttributeMap);
    return stringifyCollection(collection);
  }

  // Set canMint var, only for developers
  @EXPORT
  public setCanMint(canMint: u32): void {
    if (this.isOwner()) {
      this.canMint.setData(canMint === 0 ? false : true);
    }
  }

  // Get cryptofish collection by index(u32)
  // "getCollectionByIndex(int)[1]" => "collection(Map<string, string>)"
  @EXPORT
  public getCollectionByIndex(index: u32): string {
    return stringifyCollection(this.getCollectionByIndexPrivate(index));
  }

  @EXPORT
  public getCollectionByIndexPrivate(index: u32): Collection {
    const collections = this.collections.getData();
    const collection = collections[index];
    this.log(`getCollectionByIndex(${index}) =>`);
    this.printCollection(collection);
    return collection;
  }

  // Get cryptofish collection by attribute(string)
  // "getCollectionByAttribute(string)[123456]" => "collection(Map<string, string>)"
  @EXPORT
  public getCollectionByAttribute(attribute: string): string {
    return stringifyCollection(this.getCollectionByAttributePrivate(attribute));
  }

  @EXPORT
  public getCollectionByAttributePrivate(attribute: string): Collection {
    const collections = this.collections.getData();
    let collection!: Collection;
    for (let index = 0; index < collections.length; index += 1) {
      const current = collections[index];
      if (current.get('attribute') == attribute) {
        collection = current;
        break;
      }
    }
    this.log(`getCollectionByAttribute(${attribute}) =>`);
    this.printCollection(collection);
    return collection;
  }

  // Get owned collections
  // "getOwnedCollections()" => "collection[](Array<Map<string, string>>)"
  @EXPORT
  public getOwnedCollections(): string {
    return stringifyCollections(this.getOwnedCollectionsPrivate());
  }

  @EXPORT
  public getOwnedCollectionsPrivate(): Collection[] {
    const address: string = my.getSender().toString();
    const totalCollections = this.collections.getData();
    const collections: Collection[] = [];
    for (let index = 0; index < totalCollections.length; index += 1) {
      const collection = totalCollections[index];
      if (collection.get('creator') != address) continue;
      collections.push(collection);
    }
    this.log(`getOwnedCollections: ${collections.length}`);
    this.printCollections(collections);
    return collections;
  }

  @EXPORT
  public getCollectionCount(): u32 {
    return <u32>this.collections.getData().length;
  }

  // Get all collections with limit and skip filter
  // "getCollections(int, int)[20, 0]" => "collection[](Array<Map<string, string>>)"
  @EXPORT
  public getCollections(limit: u32, skip: u32): string {
    return stringifyCollections(this.getCollectionsPrivate(limit, skip));
  }

  @EXPORT
  public getCollectionsPrivate(limit: u32, skip: u32): Collection[] {
    const collections = this.collections.getData();
    const collectionsPart = collections.slice(skip, skip + limit);
    this.printCollections(collectionsPart);
    return collectionsPart;
  }

  // Generate unique attribute
  private generateUniqAttribute(): Attribute {
    const txHash = my.getTxHash();
    const skinRange = this.attributes.get('skin').length;
    const backgroundRange = this.attributes.get('background').length;
    const frameRange = this.attributes.get('frame').length;
    const finRange = this.attributes.get('fin').length;
    const eyeRange = this.attributes.get('eye').length;
    const tailRange = this.attributes.get('tail').length;

    for (let index = 0; index < txHash.length - 6; index += 1) {
      const sourceAttribute = txHash.substr(index, 6).split('');
      const skin = parseHex2Int(sourceAttribute[0]) % skinRange;
      const background = parseHex2Int(sourceAttribute[1]) % backgroundRange;
      const frame = parseHex2Int(sourceAttribute[2]) % frameRange;
      const fin = parseHex2Int(sourceAttribute[3]) % finRange;
      const eye = parseHex2Int(sourceAttribute[4]) % eyeRange;
      const tail = parseHex2Int(sourceAttribute[5]) % tailRange;
      const attribute = `${parseInt2Hex(skin)}${parseInt2Hex(background)}${parseInt2Hex(frame)}${parseInt2Hex(
        fin,
      )}${parseInt2Hex(eye)}${parseInt2Hex(tail)}`;
      if (this.isAttributeAvailable(attribute)) return attribute;
    }
    throw new Error('[cryptofish] cannot generate attribute');
  }

  // Calculate score by attribute
  private calculateScore(attribute: Attribute): u32 {
    const attrStrList: string[] = attribute.split('');
    const attrU32List: u32[] = attrStrList.map<u32>((hex) => parseHex2Int(hex));
    let score: u32 = 0;

    // Prevent to use `reduce` because of the closures issue in assemblyscript
    for (let index = 0; index < attrU32List.length; index++) {
      const currentScore = attrU32List[index];
      const weight = this.attributeWeights.get(this.attributeKeyList[index]) || 100;
      score += currentScore * weight;
    }
    return score;
  }

  // Attribute should be available and unique
  private isAttributeAvailable(attribute: Attribute): bool {
    // Should be unique
    const collectionAttributeMap = this.collectionAttributeMap.getData();
    if (collectionAttributeMap.has(attribute) && collectionAttributeMap.get(attribute) === true) {
      return false;
    }

    // Should be contained in attributes range

    // Congratulations! Your generated attribute is available.
    return true;
  }

  // Get is owner(developer)
  private isOwner(): bool {
    return this.owner.getData() == my.getSender().toString();
  }

  // Print collections to stdout
  private printCollections(c: Collection[]): void {
    for (let index = 0; index < c.length; index += 1) {
      this.printCollection(c[index]);
    }
  }

  // Print collection to stdout
  private printCollection(c: Collection): void {
    const index = c.get('index');
    if (!index) {
      this.log('error: collection not found');
    }
    const creator = c.get('creator');
    const attribute = c.get('attribute');
    const score = c.get('score');
    this.log(`Collection{index:${index}, creator:"${creator}", attribute:"${attribute}", score:${score}}`);
  }

  // Common log method, use [cryptofish] as prefix
  private log(message: string): void {
    my.log(`[cryptofish] ${message}`, []);
  }
}
