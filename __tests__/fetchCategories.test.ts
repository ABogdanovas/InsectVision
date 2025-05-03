import {fetchCategories} from '../src/services/fetchCategories';
import {globalStorage} from '../globalStorage';
import {Category} from '../src/beans/Category';

jest.mock('../globalStorage', () => ({
  globalStorage: {
    getString: jest.fn(),
  },
}));

describe('fetchCategories', () => {
  beforeEach(() => {
    (globalStorage.getString as jest.Mock).mockReturnValue('en');
  });

  it('should fetch all categories in English by default', async () => {
    const categories: Category[] = await fetchCategories({});

    expect(Array.isArray(categories)).toBe(true);
    expect(
      categories.find(c => c.name === 'Beetles (Coleoptera)'),
    ).toBeTruthy();
  });

  it('should fetch categories in Lithuanian when language is provided', async () => {
    const categories: Category[] = await fetchCategories({language: 'lt'});

    expect(categories.find(c => c.name.includes('Vabalai'))).toBeTruthy();
  });

  it('should fallback to stored language if language is not passed', async () => {
    (globalStorage.getString as jest.Mock).mockReturnValue('lt');

    const categories: Category[] = await fetchCategories({});

    expect(categories.find(c => c.name.includes('Vabalai'))).toBeTruthy();
  });
});
