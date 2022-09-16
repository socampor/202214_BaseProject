import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { ClubEntity } from './club.entity';

@Injectable()
export class ClubService {
  private readonly notFoundMessage: string =
    'The club with the given id was not found';

  private readonly invalidDescriptionMessage: string =
    'The given description is not valid';

  private readonly limitChar: number = 100;

  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async findAll(): Promise<ClubEntity[]> {
    return await this.clubRepository.find();
  }

  async findOne(id: string): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!club)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return club;
  }

  async create(club: ClubEntity): Promise<ClubEntity> {
    if (club.description.length > this.limitChar)
      throw new BusinessLogicException(
        this.invalidDescriptionMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.clubRepository.save(club);
  }

  async update(id: string, club: ClubEntity): Promise<ClubEntity> {
    if (club.description.length > this.limitChar)
      throw new BusinessLogicException(
        this.invalidDescriptionMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    const persistedProduct: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!persistedProduct)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    club.id = id;

    return await this.clubRepository.save(club);
  }

  async delete(id: string) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id },
    });
    if (!club)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.clubRepository.remove(club);
  }
}
