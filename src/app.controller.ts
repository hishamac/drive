import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from './utils/fileUpload';
import { diskStorage } from 'multer';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
          destination: './images',
          filename: editFileName,
      }),
      fileFilter: imageFileFilter,
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
      return this.appService.uploadFile(file);
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
      return this.appService.uploadFiles(files)
      // console.log(files);
  }

}