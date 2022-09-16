import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubEntity } from './club.entity';
import { faker } from '@faker-js/faker';
import { ClubService } from './club.service';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubList: ClubEntity[];
  const defaultId = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
  const messageProperty = 'message';
  const notFoundMessage = 'The club with the given id was not found';
  const invalidDescriptionMessage = 'The given description is not valid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubList = [];
    for (let i = 0; i < 10; i++) {
      const club: ClubEntity = await repository.save({
        name: faker.company.name(),
        foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
        image: faker.image.imageUrl(),
        description: faker.lorem.sentence(5),
      });
      clubList.push(club);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubList.length);
  });

  it('findOne should return a club by id', async () => {
    const storedClub: ClubEntity = clubList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.name).toEqual(storedClub.name);
    expect(club.foundationDate).toEqual(storedClub.foundationDate);
    expect(club.image).toEqual(storedClub.image);
    expect(club.description).toEqual(storedClub.description);
  });

  it('findOne should throw an exception for an invalid club', async () => {
    await expect(() => service.findOne(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('create should return a new club', async () => {
    const club: ClubEntity = {
      id: '',
      name: faker.company.name(),
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: faker.image.imageUrl(),
      description: faker.lorem.sentence(5),
      members: [],
    };

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: newClub.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.name).toEqual(newClub.name);
    expect(storedClub.foundationDate).toEqual(newClub.foundationDate);
    expect(storedClub.image).toEqual(newClub.image);
    expect(storedClub.description).toEqual(newClub.description);
  });

  it('create should throw an exception for an invalid description', async () => {
    const club: ClubEntity = {
      id: '',
      name: faker.company.name(),
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: faker.image.imageUrl(),
      description: faker.lorem.sentence(100),
      members: [],
    };

    await expect(() => service.create(club)).rejects.toHaveProperty(
      messageProperty,
      invalidDescriptionMessage,
    );
  });

  it('update should modify a club', async () => {
    const club: ClubEntity = clubList[0];
    club.name = 'New name';
    club.foundationDate = faker.date.between('2020-01-01', '2030-01-01');
    club.image = faker.image.imageUrl();
    club.description = 'New description';

    const updatedClub: ClubEntity = await service.update(club.id, club);
    expect(updatedClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.name).toEqual(club.name);
    expect(storedClub.foundationDate).toEqual(club.foundationDate);
    expect(storedClub.image).toEqual(club.image);
    expect(storedClub.description).toEqual(club.description);
  });

  it('update should throw an exception for an invalid club', async () => {
    let club: ClubEntity = clubList[0];
    club = {
      ...club,
      name: 'New name',
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: 'New history',
      description: 'New description',
    };
    await expect(() => service.update(defaultId, club)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('update should throw an exception for an invalid description', async () => {
    let club: ClubEntity = clubList[0];
    club = {
      ...club,
      name: 'New name',
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: 'New history',
      description: faker.lorem.sentence(100),
    };

    await expect(() => service.update(club.id, club)).rejects.toHaveProperty(
      messageProperty,
      invalidDescriptionMessage,
    );
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);

    const deletedProduct: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(deletedProduct).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    const club: ClubEntity = clubList[0];
    await service.delete(club.id);
    await expect(() => service.delete(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });
});
