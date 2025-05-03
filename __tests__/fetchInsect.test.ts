import {fetchInsect} from '../src/services/fetchInsect';
import {globalStorage} from '../globalStorage';
import {Insect} from '../src/beans/Insect';

jest.mock('../globalStorage', () => ({
  globalStorage: {
    getString: jest.fn(),
  },
}));

describe('fetchInsect', () => {
  beforeEach(() => {
    (globalStorage.getString as jest.Mock).mockReturnValue('en');
  });

  it('should fetch insect by ID and return correct data (English)', async () => {
    const insect: Insect = await fetchInsect({
      id: 1,
    });

    expect(insect).toBeDefined();
    expect(insect.name).toBe('Ladybug');
  });

  it('should fetch insect by ID and return correct data (Lithuanian)', async () => {
    const insect: Insect = await fetchInsect({
      id: 1,
      language: 'lt',
    });

    expect(insect).toBeDefined();
    expect(insect.name).toBe('Raudonoji vabalė');
  });

  it('should fallback to stored language if not provided', async () => {
    (globalStorage.getString as jest.Mock).mockReturnValue('lt');

    const insect: Insect = await fetchInsect({
      id: 1,
    });

    expect(insect.name).toBe('Raudonoji vabalė');
  });

  it('should throw error if supabase returns error', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // suppress console output

    await expect(
      fetchInsect({
        id: 9999, // non-existent ID to simulate error
      }),
    ).rejects.toThrow();
  });
});
