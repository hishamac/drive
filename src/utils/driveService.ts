import fs = require('fs');
import path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { google } from 'googleapis'

/**
 * Browse the link below to see the complete object returned for folder/file creation and search
 *
 * @link https://developers.google.com/drive/api/v3/reference/files#resource
 */
type PartialDriveFile = {
    id: string;
    name: string;
};

type SearchResultResponse = {
    kind: 'drive#fileList';
    nextPageToken: string;
    incompleteSearch: boolean;
    files: PartialDriveFile[];
};

export class GoogleDriveService {
    private driveClient;

    public constructor(clientId: string, clientSecret: string, redirectUri: string, refreshToken: string) {
        this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
    }

    createDriveClient(clientId: string, clientSecret: string, redirectUri: string, refreshToken: string) {
        const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        client.setCredentials({ refresh_token: refreshToken });

        return google.drive({
            version: 'v3',
            auth: client,
        });
    }

    createFolder(folderName: string): Promise<PartialDriveFile> {
        return this.driveClient.files.create({
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id, name',
        });
    }

    searchFolder(folderName: string): Promise<PartialDriveFile | null> {
        return new Promise((resolve, reject) => {
            this.driveClient.files.list(
                {
                    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
                    fields: 'files(id, name)',
                },
                (err, res: { data: SearchResultResponse }) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(res.data.files ? res.data.files[0] : null);
                },
            );
        });
    }

    saveFile(fileName: string, filePath: string, fileMimeType: string, folderId?: string) {
        return this.driveClient.files.create({
            requestBody: {
                name: fileName,
                mimeType: fileMimeType,
                parents: folderId ? [folderId] : [],

            },
            media: {
                mimeType: fileMimeType,
                body: fs.createReadStream(filePath),
            },
        });
    }

    makePublic(fileId: string) {
        return this.driveClient.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        }).then(res => {
            console.log('Made Public');
        }).catch(error => {
            console.log(error);
        })
    }

    deleteFile(fileId: string) {
        return this.driveClient.files.delete({
            fileId: fileId
        }).then(res => {
            console.log('File Deleted Successfully');
        }).catch(error => {
            console.log(error);
        })
    }
}