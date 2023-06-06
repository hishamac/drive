import {
    Controller,
    Get,
    Post,
    Req,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { GupService } from './gup.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/utils/fileUpload';
import { diskStorage } from 'multer';

@Controller()
export class GupController {
    constructor(private gupService: GupService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './images',
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return this.gupService.uploadFile(file);
    }

    @Post('uploads')
    @UseInterceptors(AnyFilesInterceptor({
        storage: diskStorage({
            destination: './images',
            filename: editFileName,
        }),
        fileFilter: imageFileFilter,
    }))
    uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        return this.gupService.uploadFiles(files)
        // console.log(files);
    }

}