import {jest} from '@jest/globals';
import {LowSync} from 'lowdb';

import config from '../../config';
import Database from '../../databases/database';
import InventoryService from '../InventoryService';
import {
  InventoryCreationParams,
  InventoryEditParams,
  InventoryDeleteParams,
} from '../../models/RequestParams';
import ItemDTO from '../../models/ItemDTO';
import {
  clearTestDatabases,
  getTestDatabase,
} from '../../databases/test/helpers.test';

const itemOne: ItemDTO = {
  uuid: 'ade7a73e-9825-4f87-b84b-0c02663ca4e0',
  name: 'banana',
  category: 'fruit',
  count: 20,
};
const itemTwo: ItemDTO = {
  uuid: '38464737-fcc9-415e-9241-14e529a48796',
  name: 'lychee',
  category: 'fruit',
  count: 10,
};
const itemThree: ItemDTO = {
  uuid: '0e1586c2-8060-4332-991f-92b52cf52db3',
  name: 'couch',
  category: 'furniture',
  count: 7,
};

beforeEach(() => {
  jest
    .spyOn(Database, 'getCollection')
    .mockImplementation((collection: string) => {
      return getTestDatabase(collection);
    });
  jest.spyOn(Database, 'write').mockReturnValue();
});

afterEach(() => {
  clearTestDatabases();
});

test('givenProperUUID_whenGetItem_ensureReturnItem', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();

  // when
  const item: ItemDTO = inventoryService.getItem(itemTwo.uuid);

  // ensure
  expect(item).toEqual(itemTwo);
});

test('givenImproperUUID_whenGetItem_ensureReturnBlank', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();

  // when
  const item: ItemDTO = inventoryService.getItem('test_uuid');

  // ensure
  expect(item).toEqual(undefined);
});

test('givenProperCategory_whenGetCategory_ensureReturnItems', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();

  // when
  const item: ItemDTO[] = inventoryService.getItems(itemTwo.category);

  // ensure
  expect(item).toEqual([itemOne, itemTwo]);
});

test('givenImproperCategory_whenGetCategory_ensureReturnBlank', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();

  // when
  const item: ItemDTO[] = inventoryService.getItems('test_category');

  // ensure
  expect(item).toEqual([]);
});

test('givenProperFields_whenCreateItem_ensureReturnNewItem', () => {
  // given
  const inventoryService: InventoryService = new InventoryService();
  const params: InventoryCreationParams = {
    name: 'Alfredo',
    category: 'Pastas',
    count: 20,
  };

  // when
  const item: ItemDTO = inventoryService.createItem(params);

  // ensure
  expect(item.uuid).toBeDefined();
  expect(item.name).toEqual(params.name);
  expect(item.category).toEqual(params.category);
  expect(item.count).toEqual(params.count);
});

test('givenImproperCount_whenCreateItem_ensureReturnNewItemWithZeroCount', () => {
  // given
  const inventoryService: InventoryService = new InventoryService();
  const params: InventoryCreationParams = {
    name: 'Alfredo',
    category: 'Pastas',
    count: Number('Amazing Pastas'),
  };

  // when
  const item: ItemDTO = inventoryService.createItem(params);

  // ensure
  expect(item.uuid).toBeDefined();
  expect(item.name).toEqual(params.name);
  expect(item.category).toEqual(params.category);
  expect(item.count).toEqual(0);
});

test('givenProperFields_whenEditItem_ensureReturnEditedItem', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();

  const params: InventoryEditParams = {...itemOne};
  params.name = 'grapes';
  params.count = 30;

  // when
  const item: ItemDTO = inventoryService.editItem(params);

  // ensure
  const savedItem: ItemDTO = inventoryService.getItem(params.uuid);
  expect(item).toEqual(params);
  expect(item).toEqual(savedItem);
});

test('givenImproperUUID_whenEditItem_ensureErrorThrown', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();
  const params: InventoryEditParams = {...itemOne};
  params.uuid = 'test_uuid';

  // ensure
  expect(() => {
    // when
    inventoryService.editItem(params);
  }).toThrow('Improper item uuid');
});

test('givenProperUUID_whenDeleteItem_ensureDeleted', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);
  const deletedItemsCollection: LowSync<any> = Database.getCollection(
    config.DELETED_ITEM_DATABASE,
  );

  const inventoryService: InventoryService = new InventoryService();
  const params: InventoryDeleteParams = {uuid: itemOne.uuid};

  // when
  inventoryService.deleteItem(params);

  // ensure
  const savedItem: ItemDTO = inventoryService.getItem(itemOne.uuid);
  expect(savedItem).toBe(undefined);
  expect(deletedItemsCollection.data.length).toBe(1);
});

test('givenImproperUUID_whenDeleteItem_ensureErrorThrown', () => {
  // given
  const itemsCollection: LowSync<any> = Database.getCollection(
    config.ITEM_DATABASE,
  );
  itemsCollection.data.push(itemOne, itemTwo, itemThree);

  const inventoryService: InventoryService = new InventoryService();
  const params: InventoryDeleteParams = {uuid: 'test_uuid'};

  // ensure
  expect(() => {
    // when
    inventoryService.deleteItem(params);
  }).toThrow('Improper item uuid');
});
