export interface Identity {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
}

export class Book {
    id: string;
    volumeInfo: {
        title: string,
        authors: string[],
        imageLinks: {
            smallThumbnail: string
        }
    };
    ownerId: string;
}

export enum FirebaseLists {
    books
}
