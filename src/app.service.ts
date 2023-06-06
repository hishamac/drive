import {
    Body,
    Injectable,
    Req
} from '@nestjs/common';
import * as  path from 'path';
import * as fs from 'fs';
import { GoogleDriveService } from './utils/driveService';

@Injectable()
export class AppService {
    constructor() { }

    async uploadFile(file: Express.Multer.File) {
        const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
        const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
        const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
        const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

        (async () => {
            const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);

            const finalPath = path.resolve(file.path);
            const folderName = 'Pictures';

            if (!fs.existsSync(finalPath)) {
                throw new Error('File not found!');
            }

            const link = `https://drive.google.com/uc?export=view&id=`
            let fileLink
            let fileId

            let folder = await googleDriveService.searchFolder(folderName)
                .catch((error) => {
                    console.error(error);
                    return null;
                });

            if (folder) {
                console.log(folder)
                await googleDriveService.saveFile(file.filename, finalPath, 'image/jpg', folder.id).then(res => {
                    fileId = res.data.id
                    fileLink = link + res.data.id
                }).catch((error) => {
                    console.error(error);
                });
                await googleDriveService.makePublic(fileId)
            } else {
                folder = await googleDriveService.createFolder(folderName);
                console.log(folder.data)
                await googleDriveService.saveFile(file.filename, finalPath, 'image/jpg', folder.data.id).then(res => {
                    fileId = res.data.id
                    fileLink = link + res.data.id
                }).catch((error) => {
                    console.error(error);
                });
                await googleDriveService.makePublic(fileId)
            }

            console.info('File uploaded successfully! ' + fileLink);
            await googleDriveService.deleteFile(fileId)

            // Delete the file on the server
            fs.unlinkSync(finalPath);
        })();
    }

    async uploadFiles(files: Array<Express.Multer.File>) {
        const driveClientId = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
        const driveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';
        const driveRedirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI || '';
        const driveRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            await (async () => {
                const googleDriveService = new GoogleDriveService(driveClientId, driveClientSecret, driveRedirectUri, driveRefreshToken);

                const finalPath = path.resolve(file.path);
                const folderName = 'Pictures';

                if (!fs.existsSync(finalPath)) {
                    throw new Error('File not found!');
                }

                const link = `https://drive.google.com/uc?export=view&id=`
                let fileLink
                let fileId

                let folder = await googleDriveService.searchFolder(folderName)
                    .catch((error) => {
                        console.error(error);
                        return null;
                    });

                if (folder) {
                    console.log(folder)
                    await googleDriveService.saveFile(file.filename, finalPath, 'image/jpg', folder.id).then(res => {
                        fileId = res.data.id
                        fileLink = link + res.data.id
                    }).catch((error) => {
                        console.error(error);
                    });
                    await googleDriveService.makePublic(fileId)

                } else {
                    folder = await googleDriveService.createFolder(folderName);
                    console.log(folder.data)
                    await googleDriveService.saveFile(file.filename, finalPath, 'image/jpg', folder.data.id).then(res => {
                        fileId = res.data.id
                        fileLink = link + res.data.id
                    }).catch((error) => {
                        console.error(error);
                    });
                    await googleDriveService.makePublic(fileId)
                }

                console.info('File uploaded successfully! ' + fileLink);
                // fs.unlink(finalPath, (err) => {
                //     if (err) throw err;
                //     console.log('path/file.txt was deleted');
                //   });
                fs.unlinkSync(finalPath)
            })();
        }
        console.info('Files uploaded successfully!')
    }
}