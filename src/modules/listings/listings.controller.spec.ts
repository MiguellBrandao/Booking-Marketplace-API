import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('ListingsController', () => {
  let controller: ListingsController;
  let listingsService: jest.Mocked<ListingsService>;

  beforeEach(async () => {
    const listingsServiceMock = {
      getListings: jest.fn(),
      getListing: jest.fn(),
      getListingsByHost: jest.fn(),
      createListing: jest.fn(),
      updateListing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [{ provide: ListingsService, useValue: listingsServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ListingsController);
    listingsService = module.get(ListingsService);
  });

  it('delegates get listing by id', async () => {
    listingsService.getListing.mockResolvedValue({ id: 10 } as never);

    const result = await controller.getListing(10);

    expect(result).toEqual({ id: 10 });
    expect(listingsService.getListing).toHaveBeenCalledWith(10);
  });

  it('delegates listings search with pagination', async () => {
    listingsService.getListings.mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    } as never);

    const result = await controller.getListings({ city: 'Lisbon', page: '1', limit: '10' });

    expect(result.page).toBe(1);
    expect(listingsService.getListings).toHaveBeenCalledWith({
      city: 'Lisbon',
      page: '1',
      limit: '10',
    });
  });
});
