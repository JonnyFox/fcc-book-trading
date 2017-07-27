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

export interface Trade extends FirebaseItem {
    requestTo: Identity;
    requestedBooks: Book[];
    offerFrom: Identity;
    offeredBooks: Book[];
}

export interface SelectableBook extends Book {
    isSelected: boolean;
}

export interface FirebaseItem {
    $key: string;
}

export enum FirebaseLists {
    books,
    trades,
    bookOwners
}

