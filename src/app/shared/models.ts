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

export class Trade {
    requestToId: string;
    requestedBooks: Book[];
    offerFromId: string;
    offeredBooks: Book[];
}

export interface SelectableBook extends Book {
    isSelected: boolean;
}

export enum FirebaseLists {
    books,
    trades,
    bookOwners
}

