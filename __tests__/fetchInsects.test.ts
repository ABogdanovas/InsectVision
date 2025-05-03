import {fetchInsects} from '../src/services/fetchInsects';
import {globalStorage} from '../globalStorage';

jest.mock('../globalStorage', () => ({
  globalStorage: {
    getString: jest.fn(),
  },
}));

describe('fetchInsects', () => {
  beforeEach(() => {
    (globalStorage.getString as jest.Mock).mockReturnValue('en');
  });

  it('should filter insects by search query', async () => {
    const insects = await fetchInsects({
      searchQuery: 'lady',
      filterCategories: allFalseFilters(),
      category_id: 1,
      range: {from: 0, to: 10},
    });

    expect(insects.find(i => i.name.includes('Ladybug'))).toBeTruthy();
  });

  it('should return only flying insects when isFlying is true', async () => {
    const insects = await fetchInsects({
      searchQuery: '',
      filterCategories: {...allFalseFilters(), isFlying: true},
      category_id: 1,
      range: {from: 0, to: 10},
    });

    expect(insects.every(i => i.is_flying === true)).toBe(true);
  });

  it('should return only dangerous insects when isDanger is true', async () => {
    const insects = await fetchInsects({
      searchQuery: '',
      filterCategories: {...allFalseFilters(), isDanger: true},
      category_id: 1,
      range: {from: 0, to: 10},
    });

    expect(insects.every(i => i.is_danger === true)).toBe(true);
  });

  it('should return only insects in given category', async () => {
    const insects = await fetchInsects({
      searchQuery: '',
      filterCategories: allFalseFilters(),
      category_id: 1,
      range: {from: 0, to: 10},
    });

    expect(insects.every(i => i.category_id === 1)).toBe(true);
  });

  it('should return insects matching multiple filters', async () => {
    const insects = await fetchInsects({
      searchQuery: '',
      filterCategories: {
        ...allFalseFilters(),
        isFlying: true,
        isDanger: true,
      },
      category_id: 1,
      range: {from: 0, to: 10},
    });

    expect(
      insects.every(i => i.is_flying === true && i.is_danger === true),
    ).toBe(true);
  });

  it('should return translations in lithuaniai', async () => {
    const insects = await fetchInsects({
      searchQuery: 'raud',
      filterCategories: allFalseFilters(),
      category_id: 1,
      range: {from: 0, to: 10},
      language: 'lt',
    });

    expect(insects.find(i => i.name === 'Raudonoji vabalė')).toBeTruthy();
  });

  it('should limit results by range', async () => {
    const insects = await fetchInsects({
      searchQuery: '',
      filterCategories: allFalseFilters(),
      category_id: 1,
      range: {from: 0, to: 2},
    });

    expect(insects.length).toBeLessThanOrEqual(3); // 0, 1, 2
  });

  it('should fallback to default language if unsupported', async () => {
    const insects = await fetchInsects({
      searchQuery: 'Ladybug',
      filterCategories: allFalseFilters(),
      category_id: 1,
      range: {from: 0, to: 10},
      language: 'de', // unsupported language
    });

    expect(insects.find(i => i.name === 'Ladybug')).toBeTruthy();
  });
});

function allFalseFilters() {
  return {
    isDanger: false,
    isBiting: false,
    isEndangered: false,
    isFlying: false,
    isParasite: false,
    isPoisonous: false,
  };
}
