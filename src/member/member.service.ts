import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { MemberEntity } from './member.entity';

@Injectable()
export class MemberService {
  private readonly notFoundMessage: string =
    'The member with the given id was not found';

  private readonly invalidEmailMessage: string = 'The given email is not valid';

  private readonly emailChar: string = '@';

  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async findAll(): Promise<MemberEntity[]> {
    return await this.memberRepository.find();
  }

  async findOne(id: string): Promise<MemberEntity> {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id },
    });
    if (!member)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    return member;
  }

  async create(member: MemberEntity): Promise<MemberEntity> {
    if (!member.email.includes(this.emailChar))
      throw new BusinessLogicException(
        this.invalidEmailMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    return await this.memberRepository.save(member);
  }

  async update(id: string, member: MemberEntity): Promise<MemberEntity> {
    if (!member.email.includes(this.emailChar))
      throw new BusinessLogicException(
        this.invalidEmailMessage,
        BusinessError.PRECONDITION_FAILED,
      );

    const persistedMember: MemberEntity = await this.memberRepository.findOne({
      where: { id },
    });
    if (!persistedMember)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    member.id = id;

    return await this.memberRepository.save(member);
  }

  async delete(id: string) {
    const member: MemberEntity = await this.memberRepository.findOne({
      where: { id },
    });
    if (!member)
      throw new BusinessLogicException(
        this.notFoundMessage,
        BusinessError.NOT_FOUND,
      );

    await this.memberRepository.remove(member);
  }
}
