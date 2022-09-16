import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { Repository } from 'typeorm';
import { MemberEntity } from '../member/member.entity';
import { ClubEntity } from '../club/club.entity';
import { ClubMemberService } from './club-member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ClubMemberService', () => {
  let service: ClubMemberService;
  let clubRepository: Repository<ClubEntity>;
  let memberRepository: Repository<MemberEntity>;
  let club: ClubEntity;
  let membersList: MemberEntity[];
  const defaultId = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
  const messageProperty = 'message';
  const clubNotFoundMessage = 'The club with the given id was not found';
  const memberNotFoundMessage = 'The member with the given id was not found';
  const clubMemberNotFoundMessage =
    'The member with the given id is not associated to the club';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubMemberService],
    }).compile();

    service = module.get<ClubMemberService>(ClubMemberService);
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    memberRepository = module.get<Repository<MemberEntity>>(
      getRepositoryToken(MemberEntity),
    );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    memberRepository.clear();
    clubRepository.clear();

    membersList = [];
    for (let i = 0; i < 5; i++) {
      const member: MemberEntity = await memberRepository.save({
        name: faker.company.name(),
        email: faker.internet.email(),
        birthDate: faker.date.between('2020-01-01', '2030-01-01'),
      });
      membersList.push(member);
    }

    club = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: faker.image.imageUrl(),
      description: faker.lorem.sentence(5),
      members: membersList,
    });
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add a member to a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: faker.image.imageUrl(),
      description: faker.lorem.sentence(5),
      members: membersList,
    });

    const result: ClubEntity = await service.addMemberToClub(
      newClub.id,
      newMember.id,
    );

    const resultLength = result.members.length;

    expect(resultLength).toBe(6);
    expect(result.members[resultLength - 1]).not.toBeNull();
    expect(result.members[resultLength - 1].name).toBe(newMember.name);
    expect(result.members[resultLength - 1].email).toBe(newMember.email);
    expect(result.members[resultLength - 1].birthDate).toStrictEqual(
      newMember.birthDate,
    );
  });

  it('addMemberToClub should thrown exception for an invalid member', async () => {
    const newClub: ClubEntity = await clubRepository.save({
      name: faker.company.name(),
      foundationDate: faker.date.between('2020-01-01', '2030-01-01'),
      image: faker.image.imageUrl(),
      description: faker.lorem.sentence(5),
      members: membersList,
    });

    await expect(() =>
      service.addMemberToClub(newClub.id, defaultId),
    ).rejects.toHaveProperty(messageProperty, memberNotFoundMessage);
  });

  it('addMemberToClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    await expect(() =>
      service.addMemberToClub(defaultId, newMember.id),
    ).rejects.toHaveProperty(messageProperty, clubNotFoundMessage);
  });

  it('findMembersFromClub should return members by club', async () => {
    const members: MemberEntity[] = await service.findMembersFromClub(club.id);
    expect(members.length).toBe(5);
  });

  it('findMembersFromClub should throw an exception for an invalid club', async () => {
    await expect(() =>
      service.findMembersFromClub(defaultId),
    ).rejects.toHaveProperty(messageProperty, clubNotFoundMessage);
  });

  it('findMemberFromClub should return member by club', async () => {
    const member: MemberEntity = membersList[0];
    const storedMember: MemberEntity = await service.findMemberFromClub(
      club.id,
      member.id,
    );
    expect(storedMember).not.toBeNull();
    expect(storedMember.name).toBe(member.name);
    expect(storedMember.email).toBe(member.email);
    expect(storedMember.birthDate).toStrictEqual(member.birthDate);
  });

  it('findMemberFromClub should throw an exception for an invalid member', async () => {
    await expect(() =>
      service.findMemberFromClub(club.id, defaultId),
    ).rejects.toHaveProperty(messageProperty, memberNotFoundMessage);
  });

  it('findMemberFromClub should throw an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(() =>
      service.findMemberFromClub(defaultId, member.id),
    ).rejects.toHaveProperty(messageProperty, clubNotFoundMessage);
  });

  it('findMemberFromClub should throw an exception for an member not associated to the club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    await expect(() =>
      service.findMemberFromClub(club.id, newMember.id),
    ).rejects.toHaveProperty(messageProperty, clubMemberNotFoundMessage);
  });

  it('updateMembersFromClub should update members list for a club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    const updatedClub: ClubEntity = await service.updateMembersFromClub(
      club.id,
      [newMember],
    );

    const resultLength = updatedClub.members.length;

    expect(resultLength).toBe(1);
    expect(updatedClub.members[resultLength - 1].name).toBe(newMember.name);
    expect(updatedClub.members[resultLength - 1].email).toBe(newMember.email);
    expect(updatedClub.members[resultLength - 1].birthDate).toStrictEqual(
      newMember.birthDate,
    );
  });

  it('updateMembersFromClub should throw an exception for an invalid club', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    await expect(() =>
      service.updateMembersFromClub(defaultId, [newMember]),
    ).rejects.toHaveProperty(messageProperty, clubNotFoundMessage);
  });

  it('updateMembersFromClub should throw an exception for an invalid member', async () => {
    const newMember: MemberEntity = membersList[0];
    newMember.id = defaultId;

    await expect(() =>
      service.updateMembersFromClub(club.id, [newMember]),
    ).rejects.toHaveProperty(messageProperty, memberNotFoundMessage);
  });

  it('deleteMemberFromClub should remove an member from a club', async () => {
    const member: MemberEntity = membersList[0];

    await service.deleteMemberFromClub(club.id, member.id);

    const storedClub: ClubEntity = await clubRepository.findOne({
      where: { id: club.id },
      relations: ['members'],
    });
    const deletedMember: MemberEntity = storedClub.members.find(
      (a) => a.id === member.id,
    );

    expect(deletedMember).toBeUndefined();
  });

  it('deleteMemberFromClub should thrown an exception for an invalid member', async () => {
    await expect(() =>
      service.deleteMemberFromClub(club.id, defaultId),
    ).rejects.toHaveProperty(messageProperty, memberNotFoundMessage);
  });

  it('deleteMemberFromClub should thrown an exception for an invalid club', async () => {
    const member: MemberEntity = membersList[0];
    await expect(() =>
      service.deleteMemberFromClub(defaultId, member.id),
    ).rejects.toHaveProperty(messageProperty, clubNotFoundMessage);
  });

  it('deleteMemberFromClub should thrown an exception for an non asocciated member', async () => {
    const newMember: MemberEntity = await memberRepository.save({
      name: faker.company.name(),
      email: faker.internet.email(),
      birthDate: faker.date.between('2020-01-01', '2030-01-01'),
    });

    await expect(() =>
      service.deleteMemberFromClub(club.id, newMember.id),
    ).rejects.toHaveProperty(messageProperty, clubMemberNotFoundMessage);
  });
});
