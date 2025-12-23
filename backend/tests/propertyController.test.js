const { searchProperties } = require('../src/controllers/propertyController');
const Property = require('../src/models/Property');

// Mock Mongoose Model
jest.mock('../src/models/Property');

describe('Property Controller', () => {
  it('should return properties with pagination', async () => {
    const req = {
      query: { page: '1', limit: '10' }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    // Mock Database Response
    Property.countDocuments.mockResolvedValue(1);
    Property.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ propertyId: '1', propertyType: 'Apartment' }])
    });

    await searchProperties(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      count: 1,
      page: 1,
      data: expect.arrayContaining([expect.objectContaining({ propertyId: '1' })])
    }));
  });
});
