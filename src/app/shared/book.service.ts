import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Book } from './models';

@Injectable()
export class BookService {
    constructor(private http: Http) { }

    get(query: string): Observable<Book[]> {
        if (!query || query === '') {
            return Observable.of([]);
        }

        return this.http.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
            .map(this.extractData)
            .map(result => result.items)
            .catch(this.handleError);
    }

    protected extractData(res: Response) {
        return res.json();
    }

    protected handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
