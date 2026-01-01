import { Module } from '@nestjs/common';
import { RamsService } from './rams.service';
import { RamsController } from './rams.controller';

@Module({
    controllers: [RamsController],
    providers: [RamsService],
    exports: [RamsService],
})
export class RamsModule { }
