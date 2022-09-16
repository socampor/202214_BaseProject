import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClubModule } from './club/club.module';
import { MemberModule } from './member/member.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubEntity } from './club/club.entity';
import { MemberEntity } from './member/member.entity';
import { ClubMemberModule } from './club-member/club-member.module';

@Module({
  imports: [
    ClubModule,
    MemberModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'club',
      entities: [ClubEntity, MemberEntity],
      dropSchema: true,
      synchronize: true,
      keepConnectionAlive: true,
    }),
    ClubMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
