import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MemberEntity } from './member.entity';
import { faker } from '@faker-js/faker';
import { MemberService } from './member.service';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<MemberEntity>;
  let memberList: MemberEntity[];
  const defaultId = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
  const messageProperty = 'message';
  const notFoundMessage = 'The member with the given id was not found';
  const invalidEmailMessage = 'The given email is not valid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [MemberService],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<Repository<MemberEntity>>(
      getRepositoryToken(MemberEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    memberList = [];
    for (let i = 0; i < 10; i++) {
      const member: MemberEntity = await repository.save({
        name: faker.company.name(),
        email: faker.internet.email(),
        birthDate: faker.date.between('2020-01-01', '2030-01-01'),
      });
      memberList.push(member);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all members', async () => {
    const members: MemberEntity[] = await service.findAll();
    expect(members).not.toBeNull();
    expect(members).toHaveLength(memberList.length);
  });

  it('findOne should return a member by id', async () => {
    const storedMember: MemberEntity = memberList[0];
    const member: MemberEntity = await service.findOne(storedMember.id);
    expect(member).not.toBeNull();
    expect(member.name).toEqual(storedMember.name);
    expect(member.email).toEqual(storedMember.email);
    expect(member.birthDate).toEqual(storedMember.birthDate);
  });

  it('findOne should throw an exception for an invalid member', async () => {
    await expect(() => service.findOne(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });

  it('create should return a new member', async () => {
    const member: MemberEntity = {
      id: '',
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
      clubs: [],
    };

    const newMember: MemberEntity = await service.create(member);
    expect(newMember).not.toBeNull();

    const storedMember: MemberEntity = await repository.findOne({
      where: { id: newMember.id },
    });
    expect(storedMember).not.toBeNull();
    expect(storedMember.name).toEqual(newMember.name);
    expect(storedMember.email).toEqual(newMember.email);
    expect(storedMember.birthDate).toEqual(newMember.birthDate);
  });

  it('create should throw an exception for an invalid email', async () => {
    const member: MemberEntity = {
      id: '',
      name: faker.company.name(),
      email: 'wrongmail.com',
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
      clubs: [],
    };

    await expect(() => service.create(member)).rejects.toHaveProperty(
      messageProperty,
      invalidEmailMessage,
    );
  });

  it('update should modify a member', async () => {
    const member: MemberEntity = memberList[0];
    member.name = 'New name';
    member.email = faker.internet.email();
    member.birthDate = faker.date.between('2020-01-01', '2030-01-01');

    const updatedMember: MemberEntity = await service.update(member.id, member);
    expect(updatedMember).not.toBeNull();

    const storedMember: MemberEntity = await repository.findOne({
      where: { id: member.id },
    });
    expect(storedMember).not.toBeNull();
    expect(storedMember.name).toEqual(member.name);
    expect(storedMember.email).toEqual(member.email);
    expect(storedMember.birthDate).toEqual(member.birthDate);
  });

  it('update should throw an exception for an invalid member', async () => {
    let member: MemberEntity = memberList[0];
    member = {
      ...member,
      name: 'New name',
      email: 'new@email.com',
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    };
    await expect(() =>
      service.update(defaultId, member),
    ).rejects.toHaveProperty(messageProperty, notFoundMessage);
  });

  it('update should throw an exception for an invalid email', async () => {
    let member: MemberEntity = memberList[0];
    member = {
      ...member,
      name: 'New name',
      email: 'newemail.com',
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    };
    await expect(() =>
      service.update(member.id, member),
    ).rejects.toHaveProperty(messageProperty, invalidEmailMessage);
  });

  it('delete should remove a member', async () => {
    const member: MemberEntity = memberList[0];
    await service.delete(member.id);

    const deletedProduct: MemberEntity = await repository.findOne({
      where: { id: member.id },
    });
    expect(deletedProduct).toBeNull();
  });

  it('delete should throw an exception for an invalid member', async () => {
    const member: MemberEntity = memberList[0];
    await service.delete(member.id);
    await expect(() => service.delete(defaultId)).rejects.toHaveProperty(
      messageProperty,
      notFoundMessage,
    );
  });
});
