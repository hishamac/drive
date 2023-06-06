import { Module } from '@nestjs/common';
import { GupController } from './gup.controller';
import { GupService } from './gup.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    controllers: [GupController],
    providers: [GupService]
})
export class GupModule { }
