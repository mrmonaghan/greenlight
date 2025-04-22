import { Module } from '@nestjs/common';
import { GithubModule } from './github/github.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    GithubModule, 
    ConfigModule.forRoot({load: [configuration]})
  ],
})
export class AppModule {}
